package br.unipar.upfinances.controller;

import br.unipar.upfinances.dto.MovimentacaoRequest;
import br.unipar.upfinances.dto.MovimentacaoResponse;
import br.unipar.upfinances.model.TipoMovimentacao;
import br.unipar.upfinances.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService service;

    public MovimentacaoController(MovimentacaoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MovimentacaoResponse>> listar(
            @RequestParam(required = false) TipoMovimentacao tipo,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) BigDecimal valorMin,
            @RequestParam(required = false) BigDecimal valorMax) {
        return ResponseEntity.ok(service.filtrar(tipo, descricao, dataInicio, dataFim, valorMin, valorMax));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimentacaoResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @PostMapping
    public ResponseEntity<MovimentacaoResponse> criar(@RequestBody @Valid MovimentacaoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimentacaoResponse> atualizar(@PathVariable Long id,
                                                          @RequestBody @Valid MovimentacaoRequest req) {
        return ResponseEntity.ok(service.atualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
