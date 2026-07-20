import { urlImagen } from '../api/tmdb.js';

// Muestra dónde se puede ver el título en Argentina (suscripción, alquiler,
// compra), con el logo de cada plataforma. Datos de JustWatch vía TMDB.
// `proveedores` es el objeto { link, flatrate, rent, buy } que arma el backend;
// si es null o no hay plataformas, no se renderiza nada.
export default function Proveedores({ proveedores }) {
  if (!proveedores) return null;

  const grupos = [
    { clave: 'flatrate', titulo: 'En streaming', lista: proveedores.flatrate },
    { clave: 'rent', titulo: 'Alquiler', lista: proveedores.rent },
    { clave: 'buy', titulo: 'Compra', lista: proveedores.buy },
  ].filter((g) => g.lista && g.lista.length > 0);

  if (!grupos.length) return null;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Dónde ver (Argentina)</h2>
      <div className="proveedores">
        {grupos.map((grupo) => (
          <div className="proveedores__grupo" key={grupo.clave}>
            <h3 className="proveedores__titulo">{grupo.titulo}</h3>
            <ul className="proveedores__lista">
              {grupo.lista.map((p) => {
                const logo = urlImagen(p.logo_path, 'w92');
                return (
                  <li className="proveedor" key={p.provider_id} title={p.provider_name}>
                    {logo ? (
                      <img
                        className="proveedor__logo"
                        src={logo}
                        alt={p.provider_name}
                        loading="lazy"
                      />
                    ) : (
                      <span className="proveedor__nombre">{p.provider_name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="proveedores__fuente">Información de visionado de JustWatch.</p>
    </section>
  );
}
