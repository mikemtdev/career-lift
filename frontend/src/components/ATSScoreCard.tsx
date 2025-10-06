import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ATSScoreResult } from '@/types';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface ATSScoreCardProps {
  cvId: string;
}

export function ATSScoreCard({ cvId }: ATSScoreCardProps) {
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadATSScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getATSScore(cvId);
      setAtsScore(result);
    } catch (err) {
      setError('Failed to calculate ATS score');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadATSScore();
  }, [cvId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">Calculating ATS score...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !atsScore) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive text-center">{error || 'Unable to load ATS score'}</p>
          <Button variant="outline" size="sm" onClick={loadATSScore} className="mt-2 w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'default';
    if (score >= 50) return 'warning';
    return 'destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ATS Score
            </CardTitle>
            <CardDescription>How well your CV performs with ATS systems</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{atsScore.score}</div>
            <Badge variant={getScoreBadgeVariant(atsScore.score)} className="mt-1">
              {getScoreLabel(atsScore.score)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Breakdown */}
        {showDetails && (
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm">Score Breakdown:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personal Info:</span>
                <span className="font-medium">{atsScore.breakdown.personalInfo}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Education:</span>
                <span className="font-medium">{atsScore.breakdown.education}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience:</span>
                <span className="font-medium">{atsScore.breakdown.experience}/30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skills:</span>
                <span className="font-medium">{atsScore.breakdown.skills}/20</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Formatting:</span>
                <span className="font-medium">{atsScore.breakdown.formatting}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Suggestions:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          <div className="space-y-2">
            {atsScore.suggestions.slice(0, showDetails ? undefined : 3).map((suggestion, index) => (
              <div key={index} className="flex gap-2 text-sm">
                {index === 0 && atsScore.score >= 85 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-muted-foreground">{suggestion}</span>
              </div>
            ))}
            {!showDetails && atsScore.suggestions.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{atsScore.suggestions.length - 3} more suggestions
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
