package br.unipar.upfinances.exception;

public class ConflitoException extends RuntimeException {
    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
