export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground font-sans">
          © 2026 Arithmos AI Strategist. Todos los derechos reservados.
        </p>
        <p className="text-xs text-muted-foreground/60 font-sans">
          Los números no mienten. Tu estrategia tampoco debería.
        </p>
      </div>
    </footer>
  );
}
