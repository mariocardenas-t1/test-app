"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@component-library/Button/Button";
import { Card } from "@component-library/Card/Card";
import { Input } from "@component-library/Input/Input";
import { Modal } from "@component-library/Modal/Modal";
import { useTracking } from "@component-context/TrackingContext";
import { faDownload, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString();
};

export default function DashboardPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [demoInputValue, setDemoInputValue] = useState("");
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    stats,
    statsError,
    isStatsLoading,
    interactionCount,
    lastUpdated,
    login,
    register,
    logout,
    isAuthenticated,
    user,
    authError,
    isAuthLoading,
    exportData,
  } = useTracking();

  const componentStats = useMemo(
    () => Object.entries(stats?.totals.components ?? {}),
    [stats]
  );

  const actionStats = useMemo(
    () => Object.entries(stats?.totals.actions ?? {}),
    [stats]
  );

  const variantStats = useMemo(
    () =>
      Object.entries(stats?.totals.variants ?? {}).map(([componentName, variants]) => ({
        componentName,
        variants,
      })),
    [stats]
  );

  const handleCredentialChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleDemoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDemoInputValue(event.target.value);
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExportMessage(null);
    try {
      if (authMode === "login") {
        await login(credentials);
      } else {
        await register(credentials);
      }
      setCredentials({ email: "", password: "" });
    } catch (error) {
      console.error("Authentication error", error);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    setExportError(null);
    setExportMessage(null);
    setExporting(format);
    try {
      const { blob, filename } = await exportData(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportMessage(`Exportación ${format.toUpperCase()} completada.`);
    } catch (error) {
      setExportError((error as Error).message);
    } finally {
      setExporting(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <main>
      <section className="section-title" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1>Dashboard de Analíticas</h1>
          <p className="meta-text">
            Visualiza en tiempo real las interacciones registradas por el backend.
            {lastUpdated ? ` Última actualización: ${formatTimestamp(lastUpdated.toISOString())}` : ""}
          </p>
        </div>
        <span className="badge">Conectado al backend</span>
      </section>

      <section className="metrics">
        <div className="metric-card">
          <span>Total de eventos</span>
          <strong>{interactionCount}</strong>
        </div>
        <div className="metric-card">
          <span>Eventos última hora</span>
          <strong>{stats?.totals.lastHour ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span>Último componente</span>
          <strong>{stats?.lastEvent?.componentName ?? "-"}</strong>
          <span className="meta-text">
            {stats?.lastEvent ? formatTimestamp(stats.lastEvent.createdAt) : "Sin eventos recientes"}
          </span>
        </div>
      </section>

      {statsError ? <div className="feedback error">{statsError}</div> : null}
      {isStatsLoading ? <div className="feedback">Actualizando datos...</div> : null}

      <section style={{ marginTop: "2rem" }} className="grid grid-cols-2">
        <Card borderStyle="solid">
          <Card.Header>Resumen por Componente</Card.Header>
          <Card.Body>
            {componentStats.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                {componentStats.map(([name, value]) => (
                  <li key={name} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{name}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta-text">Aún no hay registros para mostrar.</p>
            )}
          </Card.Body>
        </Card>

        <Card borderStyle="solid">
          <Card.Header>Resumen por Acción</Card.Header>
          <Card.Body>
            {actionStats.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                {actionStats.map(([name, value]) => (
                  <li key={name} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{name}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta-text">Interactúa con la biblioteca para obtener datos.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section style={{ marginTop: "1.5rem" }} className="grid grid-cols-2">
        <Card borderStyle="dashed">
          <Card.Header>Eventos recientes</Card.Header>
          <Card.Body>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Componente</th>
                    <th>Variante</th>
                    <th>Acción</th>
                    <th>Detalle</th>
                    <th>timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentEvents?.length ? (
                    stats.recentEvents.map((event) => (
                      <tr key={`${event.id}-${event.createdAt}`}>
                        <td>{event.componentName}</td>
                        <td>{event.variant ?? "-"}</td>
                        <td>{event.action}</td>
                        <td>{JSON.stringify(event.metadata ?? {})}</td>
                        <td>{formatTimestamp(event.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>Aún no hay eventos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>

        <Card borderStyle="dashed">
          <Card.Header>Variantes por componente</Card.Header>
          <Card.Body>
            {variantStats.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                {variantStats.map(({ componentName, variants }) => (
                  <li key={componentName}>
                    <strong>{componentName}</strong>
                    <div className="meta-text">
                      {Object.entries(variants)
                        .map(([variant, total]) => `${variant}: ${total}`)
                        .join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta-text">No se han registrado variantes todavía.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section style={{ marginTop: "2rem" }} className="auth-panel">
        <div className="section-title">
          <h2>Autenticación y Exportación</h2>
        </div>
        <p className="meta-text">
          Inicia sesión o regístrate para habilitar las exportaciones de datos.
        </p>

        {isAuthenticated ? (
          <div className="actions">
            <div>
              Sesión iniciada como <strong>{user?.email}</strong>
            </div>
            <Button
              variant="secondary"
              label="Cerrar sesión"
              icon={<FontAwesomeIcon icon={faRightFromBracket} />}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="grid" style={{ gap: "0.75rem" }}>
            <div className="actions">
              <Button
                type="button"
                variant={authMode === "login" ? "primary" : "secondary"}
                label="Login"
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={authMode === "register" ? "primary" : "secondary"}
                label="Registro"
                onClick={() => setAuthMode("register")}
              >
                Registro
              </Button>
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="email@demo.com"
              name="email"
              value={credentials.email}
              onChange={handleCredentialChange}
              state="default"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              name="password"
              value={credentials.password}
              onChange={handleCredentialChange}
              state="default"
              required
              minLength={6}
            />
            <Button
              variant="primary"
              type="submit"
              label={authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              loading={isAuthLoading}
            >
              {authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
            {authError ? <div className="feedback error">{authError}</div> : null}
          </form>
        )}

        <div className="actions">
          <Button
            variant="primary"
            label="Exportar CSV"
            icon={<FontAwesomeIcon icon={faDownload} />}
            disabled={!isAuthenticated}
            loading={exporting === "csv"}
            onClick={() => handleExport("csv")}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            label="Exportar JSON"
            icon={<FontAwesomeIcon icon={faDownload} />}
            disabled={!isAuthenticated}
            loading={exporting === "json"}
            onClick={() => handleExport("json")}
          >
            JSON
          </Button>
          {exportError ? <div className="feedback error">{exportError}</div> : null}
          {exportMessage ? <div className="feedback">{exportMessage}</div> : null}
          {!isAuthenticated ? (
            <div className="meta-text">
              Inicia sesión para habilitar los botones de exportación.
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ marginTop: "2rem" }} className="grid grid-cols-2">
        <Card borderStyle="solid">
          <Card.Header>Componentes interactuables</Card.Header>
          <Card.Body>
            <div className="actions" style={{ marginBottom: "1rem" }}>
              <Button
                variant="primary"
                label="Probar botón"
                onClick={() => setModalOpen(true)}
              >
                Abrir modal
              </Button>
              <Input
                label="Campo de ejemplo"
                state="default"
                placeholder="Escribe para generar eventos"
                name="demo"
                value={demoInputValue}
                onChange={handleDemoInputChange}
              />
            </div>
            <p className="meta-text">
              Estas interacciones se reportan automáticamente al backend usando la
              biblioteca de componentes existente.
            </p>
          </Card.Body>
        </Card>
      </section>

      <Modal isOpen={isModalOpen} openHandler={setModalOpen}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <h3>Modal instrumentado</h3>
          <p className="meta-text">
            Cierra el modal o interactúa con el fondo para registrar nuevos eventos.
          </p>
          <Button
            variant="secondary"
            label="Cerrar"
            onClick={() => setModalOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </main>
  );
}
