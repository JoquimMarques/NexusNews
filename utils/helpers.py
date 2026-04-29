from datetime import datetime

def format_date(date_obj):
    """Formata objetos datetime para strings amigáveis."""
    if not date_obj:
        return ""
    return date_obj.strftime("%d/%m/%Y %H:%M")

def validate_email(email):
    """Validação simples de email."""
    return "@" in email
