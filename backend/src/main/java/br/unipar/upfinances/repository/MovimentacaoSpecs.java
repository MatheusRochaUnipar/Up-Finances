package br.unipar.upfinances.repository;

import br.unipar.upfinances.model.Movimentacao;
import br.unipar.upfinances.model.TipoMovimentacao;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;
import java.time.LocalDate;

public final class MovimentacaoSpecs {

    private MovimentacaoSpecs() { }

    public static Specification<Movimentacao> doUsuario(Long usuarioId) {
        return (r, q, cb) -> usuarioId == null ? null : cb.equal(r.get("usuario").get("id"), usuarioId);
    }

    public static Specification<Movimentacao> daCategoria(Long categoriaId) {
        return (r, q, cb) -> categoriaId == null ? null : cb.equal(r.get("categoria").get("id"), categoriaId);
    }

    public static Specification<Movimentacao> comTipo(TipoMovimentacao tipo) {
        return (r, q, cb) -> tipo == null ? null : cb.equal(r.get("categoria").get("tipo"), tipo);
    }

    public static Specification<Movimentacao> descricaoContem(String texto) {
        return (r, q, cb) -> (texto == null || texto.isBlank()) ? null
                : cb.like(cb.lower(r.get("descricao")), "%" + texto.trim().toLowerCase() + "%");
    }

    public static Specification<Movimentacao> dataDe(LocalDate inicio) {
        return (r, q, cb) -> inicio == null ? null : cb.greaterThanOrEqualTo(r.<LocalDate>get("data"), inicio);
    }

    public static Specification<Movimentacao> dataAte(LocalDate fim) {
        return (r, q, cb) -> fim == null ? null : cb.lessThanOrEqualTo(r.<LocalDate>get("data"), fim);
    }

    public static Specification<Movimentacao> valorMin(BigDecimal min) {
        return (r, q, cb) -> min == null ? null : cb.greaterThanOrEqualTo(r.<BigDecimal>get("valor"), min);
    }

    public static Specification<Movimentacao> valorMax(BigDecimal max) {
        return (r, q, cb) -> max == null ? null : cb.lessThanOrEqualTo(r.<BigDecimal>get("valor"), max);
    }
}
