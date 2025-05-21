
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesPresentations } from '@/hooks/useSalesPresentations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

const PresentationAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usePresentation, usePresentationAnalytics } = useSalesPresentations();
  
  const { data: presentation, isLoading: presentationLoading } = usePresentation(id);
  const { data: analyticsData, isLoading: analyticsLoading } = usePresentationAnalytics(id);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(30); // Default to last 30 days
  
  useEffect(() => {
    if (analyticsData && analyticsData.viewsByDate) {
      // Convert analytics data to chart format
      const chartDataArray = Object.entries(analyticsData.viewsByDate).map(([dateStr, count]) => ({
        date: dateStr,
        views: count
      }));
      
      // Sort by date
      chartDataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Filter by selected time range
      const cutoffDate = subDays(new Date(), timeRange);
      const filteredData = chartDataArray.filter(item => 
        isAfter(new Date(item.date), startOfDay(cutoffDate))
      );
      
      // If no data in the time range, show empty data with date ranges
      if (filteredData.length === 0) {
        const emptyData = [];
        for (let i = timeRange; i >= 0; i -= Math.ceil(timeRange / 10)) {
          const date = subDays(new Date(), i);
          emptyData.push({
            date: format(date, 'yyyy-MM-dd'),
            views: 0
          });
        }
        setChartData(emptyData);
      } else {
        setChartData(filteredData);
      }
    }
  }, [analyticsData, timeRange]);

  const isLoading = presentationLoading || analyticsLoading;
  
  const formatViews = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(`/sales-presentations/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Presentation
          </Button>
          {isLoading ? (
            <Skeleton className="h-8 w-[250px]" />
          ) : (
            <h1 className="text-2xl font-bold">
              Analytics: {presentation?.title || 'Presentation'}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {analyticsData?.totalViews || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Viewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {analyticsData?.uniqueViewers || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average View Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {analyticsData?.averageViewTimeSeconds 
                  ? `${Math.floor(analyticsData.averageViewTimeSeconds / 60)}:${String(Math.floor(analyticsData.averageViewTimeSeconds % 60)).padStart(2, '0')}`
                  : '0:00'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
          <CardDescription>
            Number of views per day over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full h-[300px] bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    tickMargin={10}
                  />
                  <YAxis 
                    tickFormatter={formatViews}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} views`, 'Views']} 
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  />
                  <Bar 
                    dataKey="views" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    name="Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PresentationAnalytics;
