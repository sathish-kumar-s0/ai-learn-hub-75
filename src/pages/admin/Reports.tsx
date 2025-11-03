import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, FileText } from "lucide-react";

const AdminReportsContent = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("progress"),
      ]);

      const completedEnrollments =
        enrollmentsRes.data?.filter((e) => e.progress === 100).length || 0;
      const totalEnrollments = enrollmentsRes.data?.length || 0;
      const completionRate =
        totalEnrollments > 0
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalEnrollments: totalEnrollments,
        completionRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const exportToCSV = async (type: string) => {
    setLoading(true);
    try {
      let data: any[] = [];
      let filename = "";
      let headers: string[] = [];

      if (type === "users") {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        data = usersData || [];
        filename = "users_report.csv";
        headers = ["ID", "Full Name", "Created At"];
      } else if (type === "enrollments") {
        const { data: enrollmentsData } = await supabase
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
        data = enrollmentsData || [];
        filename = "enrollments_report.csv";
        headers = ["ID", "Student", "Course", "Progress", "Enrolled Date"];
      } else if (type === "courses") {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false });
        data = coursesData || [];
        filename = "courses_report.csv";
        headers = [
          "ID",
          "Title",
          "Level",
          "Duration",
          "Price",
          "Students",
          "Rating",
        ];
      }

      let csvContent = headers.join(",") + "\n";

      data.forEach((row) => {
        if (type === "users") {
          csvContent += `${row.id},"${row.full_name || "N/A"}","${new Date(
            row.created_at
          ).toLocaleDateString()}"\n`;
        } else if (type === "enrollments") {
          csvContent += `${row.id},"${row.profiles?.full_name || "N/A"}","${
            row.courses?.title || "N/A"
          }",${row.progress},"${new Date(
            row.enrolled_at
          ).toLocaleDateString()}"\n`;
        } else if (type === "courses") {
          csvContent += `${row.id},"${row.title}","${row.level}","${row.duration}","${row.price}",${row.students_count},${row.rating}\n`;
        }
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Export and analyze platform data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Users Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export a complete list of all registered users with their details
              </p>
              <Button
                onClick={() => exportToCSV("users")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Users CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Courses Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export all courses with enrollment and rating statistics
              </p>
              <Button
                onClick={() => exportToCSV("courses")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Courses CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Enrollments Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export enrollment data with student progress information
              </p>
              <Button
                onClick={() => exportToCSV("enrollments")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Enrollments CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminReports = () => {
  return (
    <ProtectedRoute requireAdmin redirectTo="/admin/login">
      <AdminReportsContent />
    </ProtectedRoute>
  );
};

export default AdminReports;
