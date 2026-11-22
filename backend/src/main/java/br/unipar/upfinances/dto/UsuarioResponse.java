package br.unipar.upfinances.dto;

import br.unipar.upfinances.model.Perfil;
import br.unipar.upfinances.model.Usuario;

public record UsuarioResponse(Long id, String nome, String email, Perfil perfil) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil());
    }
}
