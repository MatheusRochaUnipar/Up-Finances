package br.unipar.upfinances.dto;

import br.unipar.upfinances.model.Movimentacao;
import br.unipar.upfinances.model.TipoMovimentacao;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoResponse(Long id, String descricao, BigDecimal valor, LocalDate data,
                                   TipoMovimentacao tipo, Long categoriaId, String categoriaNome, Long usuarioId) {
    public static MovimentacaoResponse from(Movimentacao m) {
        return new MovimentacaoResponse(m.getId(), m.getDescricao(), m.getValor(), m.getData(),
                m.getCategoria().getTipo(), m.getCategoria().getId(), m.getCategoria().getNome(),
                m.getUsuario().getId());
    }
}
