package br.unipar.upfinances.controller;

import br.unipar.upfinances.dto.LoginRequest;
import br.unipar.upfinances.dto.LoginResponse;
import br.unipar.upfinances.dto.RegistroRequest;
import br.unipar.upfinances.dto.UsuarioResponse;
import br.unipar.upfinances.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(service.login(req));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@RequestBody @Valid RegistroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(req));
    }
}
