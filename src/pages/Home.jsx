import Countdown from '../components/Countdown';

function Home() {
  // Ganti dengan end time sebenarnya dari database nanti
  const eventEndTime = '2025-02-28T23:59:59';

  return (
    <div>
      {/* Banner */}
      <div>
        <img src="/images/banner.jpg" alt="Event Banner" />
      </div>

      {/* Event Title */}
      <div>
        <h1>🏆 KOMPETISI PASKIBRA 2025</h1>
        <p>Support your favorite school and make them champions!</p>
      </div>

      {/* Countdown */}
      <div>
        <Countdown endTime={eventEndTime} />
      </div>

      {/* Event Schedule */}
      <div>
        <h2>📅 EVENT SCHEDULE</h2>

        <div>
          <p>📍 Location</p>
          <p>Lapangan Utama, Jakarta</p>
        </div>

        <div>
          <p>📆 Date</p>
          <p>28 Februari 2025</p>
        </div>

        <div>
          <p>⏰ Time</p>
          <p>08:00 - 17:00 WIB</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
