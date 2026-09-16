export const metadata = {
  title: 'Team | Animae Caribe House',
};

export default function Team() {
  return (
    <section className="page-section">
      <div className="container page-hero centered narrow-heading">
        <span className="section-kicker">Team</span>
        <h1>The creative minds behind Animae Caribe House.</h1>
        <p>
          Animae Caribe brings together artists, animators, producers and creative organisers who share a commitment to Caribbean storytelling. Our work spans production, learning and the Festival, with collaboration at its heart.
        </p>
      </div>

      <div className="container team-page-card glass-card">
        <img src="/assets/team.webp" alt="Animae Caribe team and creative community" />
        <div>
          <h2>Working together, sharing our stories.</h2>
          <p>
            Behind every project and gathering are people who contribute their craft, experience and care. Together, we support new voices, develop creative ideas and help Caribbean stories reach audiences near and far.
          </p>
        </div>
      </div>
    </section>
  );
}
