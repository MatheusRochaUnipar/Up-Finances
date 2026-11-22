package br.unipar.upfinances.service;

import br.unipar.upfinances.dto.LoginRequest;
import br.unipar.upfinances.dto.LoginResponse;
import br.unipar.upfinances.dto.RegistroRequest;
import br.unipar.upfinances.dto.UsuarioResponse;
import br.unipar.upfinances.exception.ConflitoException;
import br.unipar.upfinances.model.Perfil;
import br.unipar.upfinances.model.Usuario;
import br.unipar.upfinances.repository.UsuarioRepository;
import br.unipar.upfinances.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.senha()));
        Usuario usuario = usuarios.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        return new LoginResponse(jwtService.gerarToken(usuario), "Bearer", usuario.getId(),
                usuario.getNome(), usuario.getPerfil());
    }

    public UsuarioResponse registrar(RegistroRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarios.existsByEmail(email)) {
            throw new ConflitoException("Já existe um usuário com este e-mail");
        }
        // cadastro público sempre cria perfil COMUM
        Usuario novo = new Usuario(req.nome().trim(), email, encoder.encode(req.senha()), Perfil.COMUM);
        return UsuarioResponse.from(usuarios.save(novo));
    }
}
