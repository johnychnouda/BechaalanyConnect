import React from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";
import ComingSoon from "@/components/ui/coming-soon";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categories.service";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/ui/breadcrumb";
import Card from "@/components/ui/card";
import Error from "next/error";

// Placeholder data for subcategories - This should come from your API
const getSubCategories = (categoryTitle: string) => {
  const subCategoriesMap: { [key: string]: any[] } = {
    "GAMING": [
      { id: 1, name: 'PUBG', image: '/pubg-image.png' },
      { id: 2, name: 'FREE FIRE', image: '/freefire-image.png' },
      { id: 3, name: 'JAWAKER', image: '/jawaker-image.png' },
      { id: 4, name: 'CLASH OF CLANS', image: '/clashofclans-image.png' },
      { id: 5, name: 'CLASH ROYAL', image: '/clashroyal-image.png' },
      { id: 6, name: 'HAY DAY', image: '/hayday-image.png' },
      { id: 7, name: 'BRAWL STARS', image: '/brawlstars-image.png' },
      { id: 8, name: 'MOBILE LEGENDS', image: '/mobilelegends-image.png' },
      { id: 9, name: 'ROBLOX', image: '/roblox-image.png' },
      { id: 10, name: 'FORTNITE', image: '/fortnite-image.png' },
      { id: 11, name: '8 BALL POOL', image: '/8ballpool-image.png' },
      { id: 12, name: 'ARENA BREAKOUT', image: '/arenabreakout-image.png' },
      { id: 13, name: 'BLOODSTRIKE', image: '/bloodstrike-image.png' },
      { id: 14, name: 'CALL OF DUTY', image: '/callofduty-image.png' },
      { id: 15, name: 'FIFA MOBILE', image: '/fifamobile-image.png' },
      { id: 16, name: 'GENSHIN IMPACT', image: '/genshinimpact-image.png' },
      { id: 17, name: 'GUNS OF GLORY', image: '/gunsofglory-image.png' },
      { id: 18, name: 'IMMORTAL KINGDOM', image: '/immortalkingdom-image.png' },
      { id: 19, name: 'INFINITY KINGDOM', image: '/infinitykingdom-image.png' },
      { id: 20, name: 'KING OF AVALON', image: '/kingofavalon-image.png' },
      { id: 21, name: 'KNIVES OUT', image: '/knivesout-image.png' },
      { id: 22, name: 'LIFE AFTER', image: '/lifeafter-image.png' },
      { id: 23, name: 'MERGE KINGDOMS', image: '/mergekingdoms-image.png' },
      { id: 24, name: 'MU ORIGINE 2', image: '/muorigine2-image.png' },
      { id: 25, name: 'PROJECT ENTROPY', image: '/projectentropy-image.png' },
      { id: 26, name: 'STATE OF SURVIVAL', image: '/stateofsurvival-image.png' },
      { id: 27, name: 'WAR ROBOTS', image: '/warrobots-image.png' },
      { id: 28, name: 'YALLA LUDO', image: '/yallaludo-image.png' },
      { id: 29, name: 'ZENLESS ZERO ZERO', image: '/zenlesszerozero-image.png' },
      { id: 30, name: 'WE PLAY', image: '/weplay-image.png' }
    ],
    // Add more category mappings as needed
  };
  return subCategoriesMap[categoryTitle] || [];
};

interface SubCategory {
  id: number;
  name: string;
  image: string;
}

const SubCategoryCard = ({ category, parentSlug }: { category: SubCategory; parentSlug: string }) => {
  const subcategorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
  return (
    <Card
      id={category.id.toString()}
      title={category.name}
      image={category.image}
      type="category"
      href={`/categories/${parentSlug}/${subcategorySlug}`}
    />
  );
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const t = useTranslations("common");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // If still loading, show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no category or categories, show 404
  if (!category || !categories.length) {
    return <Error statusCode={404} />;
  }

  // Convert URL slug back to category name format
  const getCategoryNameFromSlug = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.toUpperCase())
      .join(' ');
  };

  const categoryTitle = getCategoryNameFromSlug(category as string);
  const currentCategory = categories.find(
    (cat) => cat.title.toLowerCase() === categoryTitle.toLowerCase()
  );

  // If category not found, show 404
  if (!currentCategory) {
    return <Error statusCode={404} />;
  }

  const subCategories = getSubCategories(currentCategory.title);
  const hasContent = subCategories.length > 0;

  const breadcrumbItems = [
    { label: 'Homepage', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: currentCategory.title }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/categories" className="mb-4" />
      {hasContent ? (
        <div>
          <h1 className="text-2xl font-bold mb-6 dark:text-[#E73828]">{currentCategory.title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subCategories.map((subCategory) => (
              <SubCategoryCard 
                key={subCategory.id}
                category={subCategory} 
                parentSlug={category as string} 
              />
            ))}
          </div>
        </div>
      ) : (
        <ComingSoon title={currentCategory.title} />
      )}
    </div>
  );
} 