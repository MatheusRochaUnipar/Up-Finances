package br.unipar.upfinances.config;

import br.unipar.upfinances.model.Categoria;
import br.unipar.upfinances.model.Perfil;
import br.unipar.upfinances.model.TipoMovimentacao;
import br.unipar.upfinances.model.Usuario;
import br.unipar.upfinances.repository.CategoriaRepository;
import br.unipar.upfinances.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner carregarDadosIniciais(UsuarioRepository usuarios, CategoriaRepository categorias,
                                                   PasswordEncoder encoder) {
        return args -> {
            if (!usuarios.existsByEmail("admin@upfinances.com")) {
                usuarios.save(new Usuario("Administrador", "admin@upfinances.com",
                        encoder.encode("admin123"), Perfil.ADMIN));
            }
            if (categorias.count() == 0) {
                categorias.saveAll(List.of(
                        new Categoria("Salário", TipoMovimentacao.RECEITA),
                        new Categoria("Freela", TipoMovimentacao.RECEITA),
                        new Categoria("Alimentação", TipoMovimentacao.DESPESA),
                        new Categoria("Transporte", TipoMovimentacao.DESPESA),
                        new Categoria("Moradia", TipoMovimentacao.DESPESA),
                        new Categoria("Lazer", TipoMovimentacao.DESPESA),
                        new Categoria("Animais", TipoMovimentacao.DESPESA)));
            }
        };
    }
}
