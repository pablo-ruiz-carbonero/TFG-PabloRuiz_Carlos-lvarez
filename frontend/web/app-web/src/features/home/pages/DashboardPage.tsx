import NavBar from "../../shared/components/NavBar";

export default function DashboardScreen() {
  return (
    <>
    <NavBar />
      <h2>Buenos dias, User</h2>
      <button>+ Nuevo Cultivo</button>
      <h3>Resuemn general</h3>
      <div>
        <span>3</span>
        <p>Cultivos activos</p>
      </div>

      <div>
        <span>2</span>
        <p>Tareas pendientes</p>
      </div>

      <div>
        <span>22ºC</span>
        <p>Temperatura actual</p>
      </div>

      <h3>Cultivos recientes</h3>

      <div>
        <h3>Tomate cherry</h3>
        <span>Parcela A1</span>
      </div>
      <div>
        <h3>Pimiento rojo</h3>
        <span>Parcela B2</span>
      </div>
    </>
  )
}