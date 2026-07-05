// Cursor spotlight
const spotlight = document.getElementById("spotlight");
window.addEventListener("mousemove", (e) => {
  spotlight.style.setProperty("--x", `${e.clientX}px`);
  spotlight.style.setProperty("--y", `${e.clientY}px`);
});

// Scroll-spy: highlight the nav link of the section in view
const navLinks = document.querySelectorAll(".nav-link");
const sections = [...navLinks].map((link) =>
  document.querySelector(link.getAttribute("href"))
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        )
      );
    });
  },
  { rootMargin: "-30% 0px -60% 0px" }
);

sections.forEach((section) => section && observer.observe(section));

// ---------------------------------------------------------------------------
// Recommendations received on LinkedIn (visible ones only), newest first.
// ---------------------------------------------------------------------------
const RECOMMENDATIONS = [
  {
    name: "Joy Cruz Vargas",
    title: "Senior Product Designer at The Economist",
    relationship: "Worked with Devrath on the same team",
    date: "January 2026",
    text: "I had the pleasure of working with Dev while he served as an Android software engineer on our team. From the start, Dev stood out for his proactive mindset, strong collaboration skills, and solid engineering expertise. He never hesitates to ask thoughtful questions, clarify requirements, or suggest improvements, which made cross-functional work smooth and enjoyable. As a designer, I especially appreciated his clear communication and genuine effort to build positive relationships with every team member. Beyond his technical abilities, Dev brings optimism and energy to the team — he's fun to work with and consistently helps boost team morale. I'd happily recommend Dev to any team looking for a talented Android engineer who is highly skilled, deeply collaborative, and a joy to work with.",
  },
  {
    name: "Richard Chao",
    title: "Project Manager · Certified SAFe® 6 Lean Portfolio Manager",
    relationship: "Managed Devrath directly",
    date: "August 2025",
    text: "I've had the pleasure of working with Devrath, one of the most driven and collaborative professionals I've met. His curiosity to learn inspires those around him and raises the bar for the whole team. Devrath is also highly skilled in Android development, but what sets him apart is his mindset. For him, work isn't just a job — it's a chance to create meaningful change. Whatever the task, he approaches it with full commitment and determination. Devrath also leads with a people-first attitude: customers first, then his team, never his ego. His positivity and curiosity build camaraderie and trust, creating an environment free of drama and full of good energy. Any team would be lucky to have him.",
  },
  {
    name: "Neil Vinas",
    title: "Staff Software Engineer",
    relationship: "Managed Devrath directly",
    date: "August 2025",
    text: "I had the pleasure of working with Devrath on the Economist Mobile App. He's a talented software engineer with a passion for problem-solving and a great enthusiasm for learning and sharing knowledge. Dependable and independent, he consistently delivers while collaborating seamlessly with product, delivery, and engineering teams to keep everyone aligned. Reliable, collaborative, and always a positive presence — he's a great teammate to work with.",
  },
  {
    name: "Sreenivas Makam",
    title: "Ex: KGeN (CTO), Google, Cisco · Engineering Leader · Author",
    relationship: "Was Devrath's client",
    date: "March 2024",
    text: "I have known Devrath last 1 year and I hired him for few freelance assignments for Indigg/Kratos for native Android development. Devrath takes full ownership of projects and brings them to completion. He goes beyond the scope of work when needed. Devrath worked as an extended developer of our team and brought new ideas to solve problems. Devrath is a good communicator as well.",
  },
  {
    name: "Prabhanjan Raghavendra",
    title: "Mobile Engineering · JioHotstar, PayTM",
    relationship: "Worked with Devrath on the same team",
    date: "October 2023",
    text: "I had the pleasure of working with Devrath at TEKsystems and again at MPL. He is an exceptionally good Android Dev whom everyone respected for his depth of knowledge, his passion about latest tech and commendable work ethics. I can definitely say that he is an asset to any company and team he works for, I look upto him as a developer.",
  },
  {
    name: "Divyanshu Grover",
    title: "Vice President at Mobile Premier League (MPL)",
    relationship: "Managed Devrath directly",
    date: "August 2023",
    text: "Brilliant engineer! Devrath is really good and understands problems of scale and bakes that in his solutions and coding! He is always upto date with tech and is very hard working and sincere!",
  },
  {
    name: "Amit Kumar Singh",
    title: "Senior Engineering Manager · Mobile Engineering Leadership",
    relationship: "Managed Devrath directly",
    date: "August 2023",
    text: "Devrath is a valuable team member because of his extensive knowledge in MVVM and clean architecture in Android development. This expertise allows him to effectively design and implement scalable and maintainable code structures. He consistently follows best practices and industry standards in his work, ensuring high-quality code and efficient development processes. He is not only able to deliver excellent results on his own, but also contributes to the team's success by sharing his knowledge and assisting others whenever needed.",
  },
  {
    name: "Sudarshan Shetty",
    title: "Software Development Engineer @ MPL",
    relationship: "Worked with Devrath on different teams",
    date: "August 2023",
    text: "I am thrilled to wholeheartedly recommend my colleague with whom I've collaborated on various projects that required seamless integration between Android Native and Unity. Particularly, our collaboration on embedding Unity as a library in Android native apps showcased his exceptional skills. His deep understanding of Android native development has consistently impressed me, and his dedication and diligence are truly commendable. His swift learning ability, combined with his meticulous and organized work approach, sets him apart. A true team player.",
  },
  {
    name: "Alok Singh Baghel",
    title: "Talent Advisor @ Recro",
    relationship: "Worked with Devrath on different teams",
    date: "May 2023",
    text: "Devrath possesses a deep understanding of the Android platform and has consistently demonstrated the ability to deliver high-quality applications. He is proficient in both Java and Kotlin programming languages, allowing him to adapt to any project requirement seamlessly. Throughout our collaboration, I have been impressed by Devrath's strong communication skills and ability to work effectively in a team environment. He actively contributes ideas, provides constructive feedback, and is always willing to assist his colleagues.",
  },
  {
    name: "Advait Alai",
    title: "Product Head · Amazon Japan",
    relationship: "Worked with Devrath on the same team",
    date: "July 2022",
    text: "Fantastic tech partner. A breeze to work with and brings deep technical mobile expertise to the table. As a senior dev, Devrath was instrumental in leading a new group & launching large scale streaming services. Kept a high bar on code quality which greatly minimised issues typically seen with first launches. Any team will be lucky to have him!",
  },
  {
    name: "Swapna M",
    title: "Chief Human Resources Officer at Recro",
    relationship: "Worked with Devrath at Recro",
    date: "January 2022",
    text: "Devrath did an exceptional job at Recro. He is a very productive and multi-skilled person with vast knowledge. He is careful, proactive, self motivated and intelligent team player. It's a pleasure working with Devrath and knowing him as a customer-service oriented employee. Thanks to interpersonal skills, Devrath has great relations with both our clients and internal employees. Talented employee with very strong problem solving skills, Devrath is an asset to any company.",
  },
  {
    name: "Scott Blomquist Junior",
    title: "Senior Engineering Manager",
    relationship: "Managed Devrath directly",
    date: "January 2021",
    text: "Devrath worked as a contractor for DealerSocket, through Recro.io, for 2 quarters in 2020. His work ethic, technical capability, and attention to detail were key in enabling our delivery of a new major mobile application for our company. Thank you for everything Devrath! I hope our paths cross again in the future.",
  },
];

function renderRecommendations() {
  if (!RECOMMENDATIONS.length) return; // fallback text stays visible

  const carousel = document.getElementById("reco-carousel");
  const track = document.getElementById("reco-track");
  const fallback = document.getElementById("reco-fallback");

  // Two copies of the list make the marquee loop seamless.
  [...RECOMMENDATIONS, ...RECOMMENDATIONS].forEach((rec) => {
    const card = document.createElement("article");
    card.className = "reco-card";

    const quote = document.createElement("blockquote");
    quote.textContent = `“${rec.text}”`;

    const meta = document.createElement("footer");
    meta.className = "reco-meta";

    const name = document.createElement("span");
    name.className = "reco-name";
    name.textContent = rec.name;

    const title = document.createElement("span");
    title.className = "reco-sub";
    title.textContent = rec.title;

    const context = document.createElement("span");
    context.className = "reco-sub muted";
    context.textContent = [rec.relationship, rec.date]
      .filter(Boolean)
      .join(" · ");

    meta.append(name, title, context);
    card.append(quote, meta);
    track.appendChild(card);
  });

  // ~12s of scroll per card keeps long quotes readable.
  track.style.setProperty("--reco-dur", `${RECOMMENDATIONS.length * 12}s`);
  carousel.hidden = false;
  if (fallback) fallback.hidden = true;
}

renderRecommendations();
