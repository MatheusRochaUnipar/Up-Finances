package br.unipar.upfinances.service;

import br.unipar.upfinances.dto.MovimentacaoRequest;
import br.unipar.upfinances.dto.MovimentacaoResponse;
import br.unipar.upfinances.exception.RecursoNaoEncontradoException;
import br.unipar.upfinances.exception.RegraNegocioException;
import br.unipar.upfinances.model.Categoria;
import br.unipar.upfinances.model.Movimentacao;
import br.unipar.upfinances.model.Perfil;
import br.unipar.upfinances.model.TipoMovimentacao;
import br.unipar.upfinances.model.Usuario;
import br.unipar.upfinances.repository.MovimentacaoRepository;
import br.unipar.upfinances.repository.MovimentacaoSpecs;
import br.unipar.upfinances.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class MovimentacaoService {

    private static final Sort ORDEM = Sort.by(Sort.Direction.DESC, "data").and(Sort.by("id"));

    private final MovimentacaoRepository movimentacoes;
    private final UsuarioRepository usuarios;
    private final CategoriaService categoriaService;

    public MovimentacaoService(MovimentacaoRepository movimentacoes, UsuarioRepository usuarios,
                               CategoriaService categoriaService) {
        this.movimentacoes = movimentacoes;
        this.usuarios = usuarios;
        this.categoriaService = categoriaService;
    }

    public List<MovimentacaoResponse> filtrar(TipoMovimentacao tipo, String descricao, LocalDate dataInicio,
                                              LocalDate dataFim, BigDecimal valorMin, BigDecimal valorMax) {
        if (dataInicio != null && dataFim != null && dataInicio.isAfter(dataFim)) {
            throw new RegraNegocioException("dataInicio não pode ser posterior a dataFim");
        }
        if (valorMin != null && valorMax != null && valorMin.compareTo(valorMax) > 0) {
            throw new RegraNegocioException("valorMin não pode ser maior que valorMax");
        }
        Usuario logado = usuarioLogado();
        Specification<Movimentacao> spec = Specification.where(MovimentacaoSpecs.doUsuario(escopo(logado)))
                .and(MovimentacaoSpecs.comTipo(tipo))
                .and(MovimentacaoSpecs.descricaoContem(descricao))
                .and(MovimentacaoSpecs.dataDe(dataInicio))
                .and(MovimentacaoSpecs.dataAte(dataFim))
                .and(MovimentacaoSpecs.valorMin(valorMin))
                .and(MovimentacaoSpecs.valorMax(valorMax));
        return movimentacoes.findAll(spec, ORDEM).stream().map(MovimentacaoResponse::from).toList();
    }

    public List<MovimentacaoResponse> listarPorCategoria(Long categoriaId) {
        categoriaService.obter(categoriaId);
        Specification<Movimentacao> spec = Specification.where(MovimentacaoSpecs.doUsuario(escopo(usuarioLogado())))
                .and(MovimentacaoSpecs.daCategoria(categoriaId));
        return movimentacoes.findAll(spec, ORDEM).stream().map(MovimentacaoResponse::from).toList();
    }

    public MovimentacaoResponse buscar(Long id) {
        return MovimentacaoResponse.from(obterPermitida(id));
    }

    @Transactional
    public MovimentacaoResponse criar(MovimentacaoRequest req) {
        validar(req);
        Movimentacao m = new Movimentacao();
        preencher(m, req);
        m.setUsuario(usuarioLogado());
        return MovimentacaoResponse.from(movimentacoes.save(m));
    }

    @Transactional
    public MovimentacaoResponse atualizar(Long id, MovimentacaoRequest req) {
        validar(req);
        Movimentacao m = obterPermitida(id);
        preencher(m, req);
        return MovimentacaoResponse.from(movimentacoes.save(m));
    }

    @Transactional
    public void excluir(Long id) {
        movimentacoes.delete(obterPermitida(id));
    }


    private void validar(MovimentacaoRequest req) {
        if (req.descricao() == null || req.descricao().isBlank() || req.data() == null || req.categoriaId() == null) {
            throw new RegraNegocioException("Informe descrição, data e categoria da movimentação");
        }
        if (req.valor() == null || req.valor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("O valor da movimentação deve ser maior que zero");
        }
    }

    private void preencher(Movimentacao m, MovimentacaoRequest req) {
        Categoria categoria = categoriaService.obter(req.categoriaId());
        m.setDescricao(req.descricao().trim());
        m.setValor(req.valor().setScale(2, RoundingMode.HALF_UP));
        m.setData(req.data());
        m.setCategoria(categoria);
    }

    private Usuario usuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarios.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário autenticado não encontrado"));
    }

    /** ADMIN enxerga tudo (null = sem filtro); COMUM enxerga só as próprias movimentações. */
    private Long escopo(Usuario u) {
        return u.getPerfil() == Perfil.ADMIN ? null : u.getId();
    }

    private Movimentacao obterPermitida(Long id) {
        Usuario logado = usuarioLogado();
        Movimentacao m = movimentacoes.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Movimentação " + id + " não encontrada"));
        if (logado.getPerfil() != Perfil.ADMIN && !m.getUsuario().getId().equals(logado.getId())) {
            throw new RecursoNaoEncontradoException("Movimentação " + id + " não encontrada");
        }
        return m;
    }
}
