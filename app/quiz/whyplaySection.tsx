import React from "react";
import Image from "next/image";

function WhyplaySection() {
  const content = [
    {
      image: "/WhyGraphics/LightBulb.svg",
      title: "Learn & Grow",
      description:
        "Enhance your knowledge through interactive quizzes designed to challenge and educate. Track your progress as you advance through levels.",
      color: "bg-blue-50"
    },
    {
      image: "/WhyGraphics/Trophy.svg",
      title: "Compete & Win",
      description:
        "Join the leaderboard, earn achievements, and unlock milestones. Compare your scores with others and aim for the top spot!",
      color: "bg-amber-50"
    },
    {
      image: "/WhyGraphics/Aproved.svg",
      title: "Expert Content",
      description:
        "Access carefully curated questions covering essential topics. Each level brings new challenges and learning opportunities.",
      color: "bg-emerald-50"
    },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Play Guhuza's Brain Boost?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Challenge yourself, learn new concepts, and track your progress as you advance through exciting levels!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.map((reason, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-8 rounded-xl ${reason.color} shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="bg-white p-4 rounded-full shadow-inner mb-6">
                <Image
                  src={reason.image}
                  alt={reason.title}
                  width={60}
                  height={60}
                  className="motion-safe:animate-bounce"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {reason.title}
              </h3>
              <p className="text-gray-600">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyplaySection;
