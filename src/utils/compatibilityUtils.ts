
import { Ingredient } from './fileParser';

export const areFlavorProfilesCompatible = (
  item1: Ingredient,
  item2: Ingredient
): boolean => {
  const universalFlavors = ['mild', 'neutral', 'savory'];
  
  const item1HasUniversal = item1.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  const item2HasUniversal = item2.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  if (item1HasUniversal || item2HasUniversal) return true;
  
  return item1.flavorProfile.some(flavor => 
    item2.flavorProfile.includes(flavor)
  );
};

export const isMealCompatible = (
  protein: Ingredient, 
  grain: Ingredient,
  vegetable: Ingredient,
  sauce: Ingredient
): boolean => {
  return (
    areFlavorProfilesCompatible(protein, sauce) &&
    areFlavorProfilesCompatible(grain, sauce) &&
    areFlavorProfilesCompatible(vegetable, sauce) &&
    areFlavorProfilesCompatible(protein, vegetable)
  );
};
