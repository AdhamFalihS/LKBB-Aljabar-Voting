export default function TopMarquee() {
  return (
    <div className="fixed top-0 left-0 w-full h-20 overflow-hidden z-50">
      <div className="w-full h-full marquee-bg animate-marquee" />
    </div>
  );
}
