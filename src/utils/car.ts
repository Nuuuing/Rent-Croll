import { carDataT } from "@/types/lotte";

export const getFinalDisplayPrice = (car: carDataT): number => {
    if (typeof car.dcPrice === 'number' && car.dcPrice !== null && car.dcPrice > 0) {
        return car.dcPrice;
    }
    return car.price || 0;
};