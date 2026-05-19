import NavBar from "../../shared/components/NavBar";

export default function WeatherPage() {
  return (
    <>
      <NavBar />
      <div style={{ padding: "2rem" }}>
        <h2>🌤️ Clima</h2>
        <p>Aquí irá la información meteorológica.</p>
      </div>
    </>
  );
}
