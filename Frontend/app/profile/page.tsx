"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, MessageSquare, FileText, Bookmark, Pencil, Briefcase, GraduationCap, Building2, User, X, Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const convexUser = useQuery(api.users.getMe);
    const updateProfile = useMutation(api.users.update);
    const myPosts = useQuery(api.posts.getMyPosts);
    const myStats = useQuery(api.posts.getMyStats);
    const savedPosts = useQuery(api.saves.getSavedPosts);
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        passion: "",
        interest: "",
        organization: ""
    });

    const [imageId, setImageId] = useState("");
    const [interestTags, setInterestTags] = useState<string[]>([]);
    const [interestInput, setInterestInput] = useState("");

    const suggestions = useQuery(api.users.getSuggestions);
    const roleSuggestions = suggestions?.passions || [];
    const orgSuggestions = suggestions?.organizations || [];
    const interestSuggestions = ["React", "Next.js", "TypeScript", "JavaScript", "AI/ML", "Web Development", "UI/UX", "Writing", "Startup", "Blockchain"];


    useEffect(() => {
        if (convexUser) {
            setFormData({
                name: convexUser.name || "",
                passion: convexUser.passion || "",
                interest: "",
                organization: convexUser.organization || ""
            });
            if (convexUser.interest) {
                setInterestTags(convexUser.interest.split(",").map(s => s.trim()).filter(Boolean));
            }

            // Auto-open dialog if profile is incomplete
            const isProfileComplete = convexUser.name && convexUser.passion && convexUser.interest && convexUser.organization && convexUser.image;
            if (!isProfileComplete) {
                setIsDialogOpen(true);
                // Optional: Toast to explain why
                // toast({ title: "Please complete your profile", duration: 3000 });
            }
        }
    }, [convexUser]);

    const handleAddInterest = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !interestTags.includes(trimmed)) {
            setInterestTags([...interestTags, trimmed]);
        }
        setInterestInput("");
    };

    const handleRemoveInterest = (tagToRemove: string) => {
        setInterestTags(interestTags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if we have a Custom Image (either new upload or existing stored image)
        // We assume existing image is custom if it doesn't match the Clerk default, 
        // OR simply force upload if no imageId and current image looks like default.
        const isDefaultImage = convexUser?.image === user?.imageUrl;
        if (!imageId && (!convexUser?.image || isDefaultImage)) {
            toast({ title: "Please upload a custom profile picture", variant: "destructive" });
            return;
        }

        // Validation for tags
        if (interestTags.length === 0) {
            toast({ title: "Please add at least one skill", variant: "destructive" });
            return;
        }

        try {
            await updateProfile({
                name: formData.name,
                passion: formData.passion,
                interest: interestTags.join(", "),
                organization: formData.organization,
                imageId: (imageId as Id<"_storage">) || undefined,
            });
            toast({ title: "Profile updated successfully" });
            setIsDialogOpen(false);
        } catch (error) {
            toast({ title: "Failed to update profile", variant: "destructive" });
        }
    };

    if (!isLoaded) {
        return (
            <div className="container mx-auto py-20 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
                <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Hero Cover */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="container px-4 md:px-6 relative">
                {/* Profile Header Content */}
                <div className="-mt-20 md:-mt-24 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    {/* Avatar */}
                    <div className="relative group">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl transition-transform transform group-hover:scale-105">
                            <AvatarImage src={convexUser?.image || user.imageUrl} className="object-cover" />
                            <AvatarFallback className="text-4xl">{user.firstName?.[0] || user.username?.[0]}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{convexUser?.name || user.fullName || user.username}</h1>
                        <p className="text-lg text-muted-foreground font-medium mt-1">{convexUser?.passion || "Tech Enthusiast"}</p>

                        {/* Meta Row */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                            {convexUser?.email && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm hover:bg-muted transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>{convexUser.email}</span>
                                </div>
                            )}
                            {convexUser?.organization && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm hover:bg-muted transition-colors">
                                    <Building2 className="w-4 h-4" />
                                    <span>{convexUser.organization}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm hover:bg-muted transition-colors">
                                <User className="w-4 h-4" />
                                <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                            {convexUser?.role && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm hover:bg-muted transition-colors uppercase text-xs font-bold tracking-wider">
                                    <Shield className="w-4 h-4" />
                                    <span>{convexUser.role}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Button & Dialog */}
                    <div className="mb-4">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-full shadow-lg gap-2" size="lg">
                                    <Pencil className="w-4 h-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal information.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSave} className="space-y-4 py-4">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-full max-w-md">
                                            <Label className="mb-2 block text-center">Profile Picture <span className="text-red-500">*</span></Label>
                                            <ImageUpload
                                                onChange={setImageId}
                                                coverImageId={imageId}
                                                onRemove={() => setImageId("")}
                                                withCrop={true}
                                                aspect={1}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                value={convexUser?.email || ""}
                                                disabled
                                                className="pl-9 bg-muted"
                                            />
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="passion">Passion / Role <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="passion"
                                            value={formData.passion}
                                            onChange={(e) => setFormData({ ...formData, passion: e.target.value })}
                                            placeholder="e.g. Student, Businessman, Software Engineer"
                                            required
                                            list="passion-list"
                                        />
                                        <datalist id="passion-list">
                                            {roleSuggestions.map(role => (
                                                <option key={role} value={role} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Organization <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="organization"
                                            value={formData.organization}
                                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                            placeholder="Where do you work or study?"
                                            required
                                            list="organization-list"
                                        />
                                        <datalist id="organization-list">
                                            {orgSuggestions.map(org => (
                                                <option key={org} value={org} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interest">Skills <span className="text-red-500">*</span></Label>

                                        {interestTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {interestTags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveInterest(tag);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Input
                                                id="interest"
                                                placeholder="Add a skill..."
                                                value={interestInput}
                                                onChange={(e) => setInterestInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ',') {
                                                        e.preventDefault();
                                                        handleAddInterest(interestInput);
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => handleAddInterest(interestInput)}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs text-muted-foreground mr-1 self-center">Suggestions:</span>
                                            {interestSuggestions.map(interest => (
                                                <Badge
                                                    key={interest}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-normal"
                                                    onClick={() => handleAddInterest(interest)}
                                                >
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Skills Row */}
                {convexUser?.interest && (
                    <div className="mb-10 flex flex-wrap justify-center md:justify-start gap-2 max-w-3xl">
                        {convexUser.interest.split(",").map(tag => (
                            <Badge key={tag} variant="secondary" className="px-4 py-1.5 text-sm rounded-full bg-secondary/50 backdrop-blur hover:bg-secondary">
                                {tag.trim()}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalPosts || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalViews || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
                            <Heart className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalLikes || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                            <MessageSquare className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{myStats?.totalComments || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8 bg-muted/50 p-1">
                        <TabsTrigger value="posts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">My Posts</TabsTrigger>
                        <TabsTrigger value="saved" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Saved Posts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {myPosts && myPosts.length > 0 ? (
                                myPosts.map((post) => (
                                    <Link key={post._id} href={`/posts/${post.slug}`} className="block h-full">
                                        <Card className="h-full overflow-hidden hover:shadow-md transition-all group border-muted/60">
                                            {/* Image Section */}
                                            <div className="relative h-36 w-full bg-muted">
                                                {post.coverImageUrl ? (
                                                    <Image
                                                        src={post.coverImageUrl}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                                                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant={post.published ? "secondary" : "outline"} className="bg-background/80 backdrop-blur-sm text-[10px] h-5 px-1.5 border-0">
                                                        {post.published ? "Published" : "Draft"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-3 flex flex-col gap-2">
                                                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> {post.views}
                                                        </span>
                                                    </div>
                                                    <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-muted-foreground/25">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No posts yet. Start writing!</p>
                                    <Link href="/dashboard/create" className="text-primary hover:underline mt-2 inline-block font-medium">
                                        Create your first post
                                    </Link>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {savedPosts && savedPosts.length > 0 ? (
                                savedPosts.map((post) => (
                                    <Link key={post._id} href={`/posts/${post.slug}`} className="block h-full">
                                        <Card className="h-full overflow-hidden hover:shadow-md transition-all group border-muted/60">
                                            {/* Image Section */}
                                            <div className="relative h-36 w-full bg-muted">
                                                {(post.coverImageUrl || (post as any).coverImage) ? (
                                                    <Image
                                                        src={post.coverImageUrl || (post as any).coverImage}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                                                        <Bookmark className="h-10 w-10 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-3 flex flex-col gap-2">
                                                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                                                        <User className="w-3 h-3" /> {post.author?.name || "Unknown"}
                                                    </div>
                                                    <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-muted-foreground/25">
                                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No saved posts yet. Start bookmarking!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main >
    );
}
