import {Skeleton} from "@/components/ui/skeleton.tsx";

export const LoadingSkeleton = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ))}
        </div>
    </div>
);