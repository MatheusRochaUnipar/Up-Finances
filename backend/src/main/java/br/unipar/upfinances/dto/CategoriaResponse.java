package br.unipar.upfinances.dto;

import br.unipar.upfinances.model.Categoria;
import br.unipar.upfinances.model.TipoMovimentacao;

public record CategoriaResponse(Long id, String nome, TipoMovimentacao tipo) {
    public static CategoriaResponse from(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNome(), c.getTipo());
    }
}
