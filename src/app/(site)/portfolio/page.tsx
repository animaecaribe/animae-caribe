import { featuredProjects } from '@/data/projects';

export const metadata = {
  title: 'Portfolio | Animae Caribe House',
};

export default function Portfolio() {
  return (
    <section className="page-section">
      <div className="container page-hero centered narrow-heading">
        <span className="section-kicker">Portfolio</span>
        <h1>Animation, design and story development.</h1>
        <p>
          Explore character design, visual development and creative concepts from Animae Caribe House. These works offer a look at how ideas take shape through storytelling, design and animation.
        </p>
      </div>

      <div className="container work-grid large-grid">
        {featuredProjects.map((project, index) => (
          <article className="work-card glass-card" key={`${project.title}-${index}`}>
            <img src={project.image} alt="" />
            <div className="work-card-body">
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
