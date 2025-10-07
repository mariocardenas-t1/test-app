import {
  useMemo,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
  type ReactNode,
} from "react";
import "./App.css";
import { Button, Input } from "./components";
import { faDownload, faMugHot, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "./components/Modal/Modal";
import { Card } from "./components/Card/Card";
import { useTracking } from "./context/TrackingContext";

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString();
};

const App: FC = (): ReactNode => {
  const [modal, setModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [demoInputValue, setDemoInputValue] = useState<string>("");
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"csv" | "json" | null>(null);

  const {
    stats,
    statsError,
    isStatsLoading,
    lastUpdated,
    interactionCount,
    track,
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

  const variantStats = useMemo(() => {
    if (!stats?.totals.variants) return [] as Array<[string, Record<string, number>]>;
    return Object.entries(stats.totals.variants);
  }, [stats]);

  const handleModal = (newIsOpen: boolean): void => {
    setModal(newIsOpen);
  };

  const handleCredentialChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setCredentials((previous) => ({ ...previous, [name]: value }));
  };

  const handleDemoInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDemoInputValue(event.target.value);
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setExportMessage(null);
    try {
      if (authMode === "login") {
        const response = await login(credentials);
        track({
          componentName: "Auth",
          action: "login",
          metadata: { email: response.user.email },
        });
      } else {
        const response = await register(credentials);
        track({
          componentName: "Auth",
          action: "register",
          metadata: { email: response.user.email },
        });
      }
      setCredentials({ email: "", password: "" });
    } catch (error) {
      console.error("Authentication error", error);
    }
  };

  const handleExport = async (format: "csv" | "json"): Promise<void> => {
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
      track({
        componentName: "Dashboard",
        action: "export",
        variant: format,
        metadata: { filename },
      });
    } catch (error) {
      setExportError((error as Error).message);
    } finally {
      setExporting(null);
    }
  };

  const handleLogout = (): void => {
    logout();
    track({ componentName: "Auth", action: "logout" });
  };

  return (
    <main>
      <section className="app-header">
        <h1>Component Analytics Demo</h1>
        <p>
          Showcase interactivo de la librería de componentes con tracking automático.
          Todas las interacciones son registradas en tiempo real y enviadas al backend
          de analíticas construido para esta demo.
        </p>
        <div className="meta-text">
          Interacciones registradas: <strong>{interactionCount}</strong>
          {lastUpdated ? ` · Actualizado ${formatTimestamp(lastUpdated.toISOString())}` : null}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Componentes</h2>
          <span className="badge">Tracking automático activado</span>
        </div>
        <div className="component-grid">
          <div className="component-card">
            <h3>Buttons</h3>
            <div className="button-variants">
              <Button
                variant="primary"
                label="Comprar"
                icon={<FontAwesomeIcon icon={faMugHot} />}
                onClick={() => alert("Button primary clicked")}
              >
                Comprar
              </Button>
              <Button
                variant="secondary"
                label="Secundario"
                onClick={() => alert("Button secondary clicked")}
              >
                Secundario
              </Button>
              <Button
                variant="danger"
                label="Eliminar"
                onClick={() => alert("Button danger clicked")}
              >
                Eliminar
              </Button>
              <Button
                variant="primary"
                label="Cargando"
                loading
                onClick={() => undefined}
              >
                Loading
              </Button>
              <Button
                variant="secondary"
                label="Deshabilitado"
                disabled
                onClick={() => undefined}
              >
                Disabled
              </Button>
            </div>
          </div>

          <div className="component-card">
            <h3>Inputs</h3>
            <div className="input-variants">
              <Input
                label="Campo estándar"
                state="default"
                placeholder="Default"
                name="default"
                value={demoInputValue}
                onChange={handleDemoInputChange}
              />
              <Input
                label="Error"
                state="error"
                placeholder="Error"
                name="error"
              />
              <Input
                label="Success"
                state="success"
                placeholder="Success"
                name="success"
              />
            </div>
          </div>

          <div className="component-card">
            <h3>Modal</h3>
            <Button
              variant="primary"
              label="Abrir modal"
              onClick={() => handleModal(true)}
            >
              Abrir modal
            </Button>
            <Modal isOpen={modal} openHandler={handleModal}>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <h4>Modal de ejemplo</h4>
                <p>
                  Este modal registra eventos de apertura, cierre y clicks fuera del
                  contenido.
                </p>
                <Button
                  variant="secondary"
                  label="Cerrar modal"
                  onClick={() => handleModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </Modal>
          </div>

          <div className="component-card">
            <h3>Cards</h3>
            <div className="card-variants">
              <Card borderStyle="solid">
                <Card.Header>Card Solid</Card.Header>
                <Card.Body>
                  <p>Card con borde sólido.</p>
                </Card.Body>
                <Card.Footer>
                  <Button
                    variant="primary"
                    label="Acción"
                    onClick={() => alert("Card Solid action")}
                  >
                    Acción
                  </Button>
                </Card.Footer>
              </Card>
              <Card borderStyle="dashed">
                <Card.Header>Card Dashed</Card.Header>
                <Card.Body>
                  <p>Card con borde punteado.</p>
                </Card.Body>
              </Card>
              <Card borderStyle="none">
                <Card.Header>Card Clean</Card.Header>
                <Card.Body>
                  <p>Card sin borde para layouts minimalistas.</p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-dashboard">
        <div className="section-title">
          <h2>Estadísticas en Tiempo Real</h2>
          <span className="meta-text">
            {isStatsLoading ? "Actualizando..." : "Datos en vivo"}
          </span>
        </div>

        {statsError ? <div className="feedback error">{statsError}</div> : null}

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total interacciones</span>
            <strong>{interactionCount}</strong>
          </div>
          <div className="stat-card">
            <span>Última hora</span>
            <strong>{stats?.totals.lastHour ?? 0}</strong>
          </div>
          <div className="stat-card">
            <span>Último evento</span>
            <strong>{stats?.lastEvent?.componentName ?? "-"}</strong>
            <span className="meta-text">
              {stats?.lastEvent ? formatTimestamp(stats.lastEvent.createdAt) : "Sin eventos"}
            </span>
          </div>
        </div>

        <div className="stats-lists">
          <div className="stats-list">
            <h4>Por componente</h4>
            <ul>
              {componentStats.length ? (
                componentStats.map(([name, total]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <strong>{total}</strong>
                  </li>
                ))
              ) : (
                <li>No hay datos todavía.</li>
              )}
            </ul>
          </div>
          <div className="stats-list">
            <h4>Por acción</h4>
            <ul>
              {actionStats.length ? (
                actionStats.map(([name, total]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <strong>{total}</strong>
                  </li>
                ))
              ) : (
                <li>No hay datos todavía.</li>
              )}
            </ul>
          </div>
          <div className="stats-list">
            <h4>Por variante</h4>
            <ul>
              {variantStats.length ? (
                variantStats.map(([componentName, variants]) => (
                  <li key={componentName}>
                    <span>{componentName}</span>
                    <strong>
                      {Object.entries(variants)
                        .map(([variant, total]) => `${variant}: ${total}`)
                        .join(" · ")}
                    </strong>
                  </li>
                ))
              ) : (
                <li>No hay datos todavía.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="recent-events">
          <h3>Eventos recientes</h3>
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Variante</th>
                <th>Acción</th>
                <th>Detalle</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentEvents.length ? (
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
                  <td colSpan={5}>Interactúa con los componentes para ver datos aquí.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="auth-card">
        <div className="section-title">
          <h2>Autenticación y Exportación</h2>
        </div>
        <p className="meta-text">
          Inicia sesión o regístrate para habilitar la exportación de datos en CSV o JSON.
        </p>

        {isAuthenticated ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
          <form onSubmit={handleAuthSubmit}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button
                variant={authMode === "login" ? "primary" : "secondary"}
                type="button"
                label="Login"
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                variant={authMode === "register" ? "primary" : "secondary"}
                type="button"
                label="Registrar"
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

        <div>
          <h3>Exportar datos</h3>
          <div className="export-actions">
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
          </div>
          {exportError ? <div className="feedback error">{exportError}</div> : null}
          {exportMessage ? <div className="feedback">{exportMessage}</div> : null}
          {!isAuthenticated ? (
            <div className="meta-text">Inicia sesión para habilitar los botones de exportación.</div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default App;
