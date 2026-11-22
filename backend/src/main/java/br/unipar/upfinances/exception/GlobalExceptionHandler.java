package br.unipar.upfinances.exception;

import br.unipar.upfinances.dto.ErroResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ErroResponse> resposta(HttpStatus status, String mensagem, List<String> detalhes) {
        ErroResponse corpo = new ErroResponse(status.value(), status.getReasonPhrase(), mensagem,
                LocalDateTime.now(), detalhes);
        return ResponseEntity.status(status).body(corpo);
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(RecursoNaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, e.getMessage(), List.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponse> rotaInexistente(NoResourceFoundException e) {
        return resposta(HttpStatus.NOT_FOUND, "Rota não encontrada", List.of());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException e) {
        return resposta(HttpStatus.BAD_REQUEST, e.getMessage(), List.of());
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponse> conflito(ConflitoException e) {
        return resposta(HttpStatus.CONFLICT, e.getMessage(), List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException e) {
        List<String> detalhes = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage()).toList();
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos", detalhes);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> corpoIlegivel(HttpMessageNotReadableException e) {
        return resposta(HttpStatus.BAD_REQUEST,
                "Corpo da requisição inválido (verifique tipos, datas AAAA-MM-DD e valores de enum)", List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return resposta(HttpStatus.BAD_REQUEST, "Valor inválido para o parâmetro '" + e.getName() + "'", List.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResponse> metodoNaoSuportado(HttpRequestMethodNotSupportedException e) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP não suportado nesta rota", List.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> credenciais(BadCredentialsException e) {
        return resposta(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos", List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AccessDeniedException e) {
        return resposta(HttpStatus.FORBIDDEN, "Acesso negado para o seu perfil", List.of());
    }
}
