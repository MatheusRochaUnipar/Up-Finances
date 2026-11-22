package br.unipar.upfinances.controller;

import br.unipar.upfinances.dto.CategoriaRequest;
import br.unipar.upfinances.dto.CategoriaResponse;
import br.unipar.upfinances.dto.MovimentacaoResponse;
import br.unipar.upfinances.service.CategoriaService;
import br.unipar.upfinances.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService service;
    private final MovimentacaoService movimentacaoService;

    public CategoriaController(CategoriaService service, MovimentacaoService movimentacaoService) {
        this.service = service;
        this.movimentacaoService = movimentacaoService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @GetMapping("/{id}/movimentacoes")
    public ResponseEntity<List<MovimentacaoResponse>> movimentacoesDaCategoria(@PathVariable Long id) {
        return ResponseEntity.ok(movimentacaoService.listarPorCategoria(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@RequestBody @Valid CategoriaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> atualizar(@PathVariable Long id, @RequestBody @Valid CategoriaRequest req) {
        return ResponseEntity.ok(service.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
