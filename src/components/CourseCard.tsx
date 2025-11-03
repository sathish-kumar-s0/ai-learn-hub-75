import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  price: string;
  imageUrl?: string;
  instructorName?: string;
  rating?: number;
  studentsCount?: number;
  lessonsCount?: number;
  enrolled?: boolean;
  progress?: number;
}

export const CourseCard = ({
  id,
  title,
  description,
  level,
  duration,
  price,
  imageUrl,
  instructorName,
  rating,
  studentsCount,
  lessonsCount,
  enrolled = false,
  progress = 0,
}: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/course/${id}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {enrolled && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-white">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/course/${id}`} className="flex-1">
            <h3 className="line-clamp-2 font-semibold leading-tight transition-colors group-hover:text-primary">
              {title}
            </h3>
          </Link>
          <Badge variant="secondary" className={getLevelColor(level)}>
            {level}
          </Badge>
        </div>
        {instructorName && (
          <p className="text-sm text-muted-foreground">{instructorName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
          )}
          {studentsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{studentsCount.toLocaleString()}</span>
            </div>
          )}
          {lessonsCount !== undefined && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessonsCount} lessons</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="text-lg font-bold text-primary">{price}</div>
        <Link to={enrolled ? `/learn/${id}` : `/course/${id}`}>
          <Button variant={enrolled ? "outline" : "default"}>
            {enrolled ? "Continue Learning" : "View Course"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
