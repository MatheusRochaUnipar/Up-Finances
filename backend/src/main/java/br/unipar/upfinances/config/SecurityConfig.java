package br.unipar.upfinances.config;

import br.unipar.upfinances.repository.UsuarioRepository;
import br.unipar.upfinances.security.JwtAuthFilter;
import br.unipar.upfinances.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService,
                                           UserDetailsService userDetailsService) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/auth/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                // categorias: qualquer usuário logado consulta; só ADMIN altera
                .requestMatchers(HttpMethod.POST, "/categorias/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/categorias/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/categorias/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                        escrever(res, 401, "Unauthorized", "Autenticação necessária ou token inválido/expirado"))
                .accessDeniedHandler((req, res, ex) ->
                        escrever(res, 403, "Forbidden", "Acesso negado para o seu perfil")))
            .addFilterBefore(new JwtAuthFilter(jwtService, userDetailsService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private static void escrever(HttpServletResponse res, int status, String erro, String mensagem) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"erro\":\"" + erro + "\",\"mensagem\":\"" + mensagem + "\"}");
    }

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository repository) {
        return email -> repository.findByEmail(email)
                .map(u -> User.withUsername(u.getEmail()).password(u.getSenha()).roles(u.getPerfil().name()).build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.origens}") String origens) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(origens.split(",")).map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
