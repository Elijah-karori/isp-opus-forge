import { useQuery } from '@tanstack/react-query';
import { getProjectTeam } from '@/api/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, User, Users } from 'lucide-react';

interface ProjectTeamViewProps {
    projectId: number;
}

export function ProjectTeamView({ projectId }: ProjectTeamViewProps) {
    const { data: team, isLoading } = useQuery({
        queryKey: ['project-team', projectId],
        queryFn: () => getProjectTeam(projectId).then(res => res.data),
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!team) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                    No team members assigned yet.
                </CardContent>
            </Card>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Project Team</CardTitle>
                    <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {(team.team_members?.length || 0) + (team.project_manager ? 1 : 0) + (team.tech_lead ? 1 : 0)} members
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Project Manager */}
                {team.project_manager && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Project Manager</h4>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                            <Avatar>
                                <AvatarFallback>{getInitials(team.project_manager.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="font-medium">{team.project_manager.full_name}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {team.project_manager.email}
                                </div>
                            </div>
                            <Badge>PM</Badge>
                        </div>
                    </div>
                )}

                {/* Tech Lead */}
                {team.tech_lead && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Technical Lead</h4>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                            <Avatar>
                                <AvatarFallback>{getInitials(team.tech_lead.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="font-medium">{team.tech_lead.full_name}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {team.tech_lead.email}
                                </div>
                            </div>
                            <Badge>Tech Lead</Badge>
                        </div>
                    </div>
                )}

                {/* Team Members */}
                {team.team_members && team.team_members.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Team Members</h4>
                        <div className="space-y-2">
                            {team.team_members.map((member) => (
                                <div
                                    key={member.user_id}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {getInitials(member.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="text-sm font-medium">{member.full_name}</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            {member.email}
                                        </div>
                                    </div>
                                    {member.role && (
                                        <Badge variant="outline" className="text-xs">
                                            {member.role}
                                        </Badge>
                                    )}
                                    {member.department && (
                                        <span className="text-xs text-muted-foreground">{member.department}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!team.project_manager && !team.tech_lead && (!team.team_members || team.team_members.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No team members assigned to this project yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
