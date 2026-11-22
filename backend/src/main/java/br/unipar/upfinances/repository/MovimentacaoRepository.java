package br.unipar.upfinances.repository;

import br.unipar.upfinances.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long>, JpaSpecificationExecutor<Movimentacao> {
    boolean existsByCategoriaId(Long categoriaId);
}
