package br.unipar.upfinances.dto;

import br.unipar.upfinances.model.Perfil;

public record LoginResponse(String token, String tipo, Long usuarioId, String nome, Perfil perfil) {
}
