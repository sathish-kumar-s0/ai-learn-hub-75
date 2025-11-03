import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Enrollment {
  id: string;
  progress: number;
  enrolled_at: string;
  profiles: {
    full_name: string;
  };
  courses: {
    title: string;
  };
}

const AdminEnrollmentsContent = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(
          `
          id,
          progress,
          enrolled_at,
          profiles (full_name),
          courses (title)
        `
        )
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to load enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Enrollments</h1>
          <p className="text-muted-foreground">
            View all course enrollments and student progress
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary">{enrollments.length} enrollments</Badge>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enrolled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No enrollments found
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{enrollment.courses?.title || "N/A"}</TableCell>
                    <TableCell>
                      <div className="w-48">
                        <ProgressBar
                          value={enrollment.progress}
                          showLabel={false}
                          size="sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminEnrollments = () => {
  return (
    <ProtectedRoute requireAdmin redirectTo="/admin/login">
      <AdminEnrollmentsContent />
    </ProtectedRoute>
  );
};

export default AdminEnrollments;
