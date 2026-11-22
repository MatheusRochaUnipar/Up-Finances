package br.unipar.upfinances.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoRequest(
        @NotBlank(message = "A descrição é obrigatória") String descricao,
        @NotNull(message = "O valor é obrigatório") @Positive(message = "O valor deve ser maior que zero") BigDecimal valor,
        @NotNull(message = "A data é obrigatória (AAAA-MM-DD)") LocalDate data,
        @NotNull(message = "A categoria é obrigatória") Long categoriaId) {
}
