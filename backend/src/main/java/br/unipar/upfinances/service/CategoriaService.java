package br.unipar.upfinances.service;

import br.unipar.upfinances.dto.CategoriaRequest;
import br.unipar.upfinances.dto.CategoriaResponse;
import br.unipar.upfinances.exception.ConflitoException;
import br.unipar.upfinances.exception.RecursoNaoEncontradoException;
import br.unipar.upfinances.model.Categoria;
import br.unipar.upfinances.repository.CategoriaRepository;
import br.unipar.upfinances.repository.MovimentacaoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categorias;
    private final MovimentacaoRepository movimentacoes;

    public CategoriaService(CategoriaRepository categorias, MovimentacaoRepository movimentacoes) {
        this.categorias = categorias;
        this.movimentacoes = movimentacoes;
    }

    public List<CategoriaResponse> listar() {
        return categorias.findAll(Sort.by("nome")).stream().map(CategoriaResponse::from).toList();
    }

    public CategoriaResponse buscar(Long id) {
        return CategoriaResponse.from(obter(id));
    }

    public Categoria obter(Long id) {
        return categorias.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + id + " não encontrada"));
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest req) {
        verificarDuplicada(req, null);
        return CategoriaResponse.from(categorias.save(new Categoria(req.nome().trim(), req.tipo())));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest req) {
        Categoria categoria = obter(id);
        verificarDuplicada(req, id);
        categoria.setNome(req.nome().trim());
        categoria.setTipo(req.tipo());
        return CategoriaResponse.from(categorias.save(categoria));
    }

    @Transactional
    public void excluir(Long id) {
        Categoria categoria = obter(id);
        if (movimentacoes.existsByCategoriaId(id)) {
            throw new ConflitoException("Não é possível excluir: a categoria possui movimentações");
        }
        categorias.delete(categoria);
    }

    private void verificarDuplicada(CategoriaRequest req, Long idAtual) {
        categorias.findByNomeIgnoreCaseAndTipo(req.nome().trim(), req.tipo())
                .filter(c -> !c.getId().equals(idAtual))
                .ifPresent(c -> {
                    throw new ConflitoException("Já existe uma categoria com este nome e tipo");
                });
    }
}
