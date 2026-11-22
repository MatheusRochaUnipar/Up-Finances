package br.unipar.upfinances.repository;

import br.unipar.upfinances.model.Categoria;
import br.unipar.upfinances.model.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNomeIgnoreCaseAndTipo(String nome, TipoMovimentacao tipo);
}
