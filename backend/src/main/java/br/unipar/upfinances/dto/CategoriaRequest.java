package br.unipar.upfinances.dto;

import br.unipar.upfinances.model.TipoMovimentacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequest(
        @NotBlank(message = "O nome é obrigatório") String nome,
        @NotNull(message = "O tipo é obrigatório (RECEITA ou DESPESA)") TipoMovimentacao tipo) {
}
