import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Play, Pause, CheckCircle, Circle, Lock, Download, 
  MessageSquare, FileText, Award, Clock, ChevronRight, Send,
  ThumbsUp, Pin, Upload, AlertCircle, Video, BookOpen
} from "lucide-react";

interface EspaceCoursApprentissageProps {
  formationId: string;
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document" | "quiz" | "devoir";
  completed: boolean;
  locked: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Question {
  id: string;
  author: string;
  content: string;
  date: string;
  answers: { author: string; content: string; date: string; pinned?: boolean }[];
  upvotes: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const mockChapters: Chapter[] = [
  {
    id: "ch1",
    title: "Introduction aux marchés publics",
    lessons: [
      { id: "l1", title: "Comprendre les AO", duration: "12 min", type: "video", completed: true, locked: false },
      { id: "l2", title: "Types de marchés", duration: "8 min", type: "video", completed: true, locked: false },
      { id: "l3", title: "Ressources clés", duration: "5 min", type: "document", completed: false, locked: false },
      { id: "l4", title: "Quiz chapitre 1", duration: "10 min", type: "quiz", completed: false, locked: false },
    ]
  },
  {
    id: "ch2",
    title: "Préparer son dossier",
    lessons: [
      { id: "l5", title: "Documents administratifs", duration: "15 min", type: "video", completed: false, locked: false },
      { id: "l6", title: "Offre technique", duration: "20 min", type: "video", completed: false, locked: false },
      { id: "l7", title: "Offre financière", duration: "18 min", type: "video", completed: false, locked: true },
      { id: "l8", title: "Devoir pratique", duration: "45 min", type: "devoir", completed: false, locked: true },
    ]
  },
  {
    id: "ch3",
    title: "Soumettre et négocier",
    lessons: [
      { id: "l9", title: "Plateformes de soumission", duration: "10 min", type: "video", completed: false, locked: true },
      { id: "l10", title: "Négociation post-AO", duration: "12 min", type: "video", completed: false, locked: true },
      { id: "l11", title: "Quiz final", duration: "15 min", type: "quiz", completed: false, locked: true },
    ]
  }
];

const mockQuestions: Question[] = [
  {
    id: "q1",
    author: "Marie K.",
    content: "Est-ce que le cautionnement est obligatoire pour tous les types de marchés ?",
    date: "Il y a 2 jours",
    upvotes: 5,
    answers: [
      { author: "Formateur", content: "Non, le cautionnement dépend du montant et du type de marché. Pour les marchés < 10M FCFA, il est souvent optionnel.", date: "Il y a 1 jour", pinned: true }
    ]
  },
  {
    id: "q2",
    author: "Jean-Paul M.",
    content: "Comment calculer le prix unitaire dans l'offre financière ?",
    date: "Il y a 3 jours",
    upvotes: 3,
    answers: []
  }
];

const mockQuiz: QuizQuestion[] = [
  {
    id: "quiz1",
    question: "Quel document est obligatoire pour une soumission AO public ?",
    options: ["RCCM uniquement", "DFE uniquement", "RCCM + DFE + Attestation fiscale", "Aucun document"],
    correctIndex: 2
  },
  {
    id: "quiz2",
    question: "Quel est le délai minimum de publication d'un AO ouvert ?",
    options: ["7 jours", "15 jours", "30 jours", "45 jours"],
    correctIndex: 2
  },
  {
    id: "quiz3",
    question: "Le SIGMAP est utilisé pour :",
    options: ["La gestion RH", "Les marchés publics", "La comptabilité", "Les impôts"],
    correctIndex: 1
  }
];

export function EspaceCoursApprentissage({ formationId, onBack }: EspaceCoursApprentissageProps) {
  const [chapters] = useState<Chapter[]>(mockChapters);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(mockChapters[0].lessons[2]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState<"notes" | "resources" | "qa">("qa");
  const [userNotes, setUserNotes] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [questions] = useState<Question[]>(mockQuestions);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Devoir state
  const [devoirFile, setDevoirFile] = useState<File | null>(null);

  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedLessons = chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.completed).length, 0);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  const remainingTime = "1h 45min";

  const handleQuizSubmit = () => {
    let correct = 0;
    mockQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.locked) return <Lock className="w-4 h-4 text-muted-foreground" />;
    if (lesson.completed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-3 h-3" />;
      case "quiz": return <FileText className="w-3 h-3" />;
      case "document": return <BookOpen className="w-3 h-3" />;
      case "devoir": return <Upload className="w-3 h-3" />;
      default: return null;
    }
  };

  const renderContent = () => {
    switch (currentLesson.type) {
      case "video":
        return (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="rounded-full w-16 h-16"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
                <div className="flex items-center gap-4 text-white">
                  <span className="text-sm">02:45 / {currentLesson.duration}</span>
                  <Progress value={35} className="flex-1 h-1" />
                  <Button variant="ghost" size="sm" className="text-white">
                    <Download className="w-4 h-4 mr-1" /> Ressources
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" /> Marquer terminé
              </Button>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">Ressources téléchargeables</p>
                <p className="text-muted-foreground mb-4">Documents PDF, modèles et checklists</p>
                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" /> Checklist documents AO.pdf
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" /> Modèle offre technique.docx
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" /> Tableau comparatif.xlsx
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" /> Marquer terminé
              </Button>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
              {quizSubmitted && (
                <Badge variant={quizScore >= 2 ? "default" : "destructive"}>
                  Score: {quizScore}/{mockQuiz.length}
                </Badge>
              )}
            </div>
            
            {mockQuiz.map((q, idx) => (
              <Card key={q.id} className={quizSubmitted && quizAnswers[q.id] === q.correctIndex ? "border-green-500" : quizSubmitted ? "border-red-500" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Question {idx + 1}: {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={quizAnswers[q.id]?.toString()}
                    onValueChange={(v) => setQuizAnswers({ ...quizAnswers, [q.id]: parseInt(v) })}
                    disabled={quizSubmitted}
                  >
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`flex items-center space-x-2 p-2 rounded ${
                        quizSubmitted && optIdx === q.correctIndex ? "bg-green-100 dark:bg-green-900/20" : ""
                      }`}>
                        <RadioGroupItem value={optIdx.toString()} id={`${q.id}-${optIdx}`} />
                        <Label htmlFor={`${q.id}-${optIdx}`} className="cursor-pointer flex-1">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {!quizSubmitted ? (
              <Button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < mockQuiz.length}>
                Soumettre le quiz
              </Button>
            ) : (
              <div className="flex gap-2">
                {quizScore >= 2 ? (
                  <Button>
                    <ChevronRight className="w-4 h-4 mr-2" /> Leçon suivante
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                    Réessayer
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case "devoir":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Instructions du devoir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Préparez un dossier de soumission complet pour un AO fictif de fourniture de matériel informatique :</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Lettre de soumission</li>
                  <li>Offre technique (max 5 pages)</li>
                  <li>Bordereau des prix unitaires</li>
                  <li>Planning prévisionnel</li>
                </ul>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Date limite : 15 janvier 2026</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {devoirFile ? (
                  <div>
                    <p className="font-medium">{devoirFile.name}</p>
                    <Button variant="link" onClick={() => setDevoirFile(null)}>Supprimer</Button>
                  </div>
                ) : (
                  <>
                    <p className="mb-2">Glissez votre fichier ici ou</p>
                    <Button variant="outline" onClick={() => document.getElementById('devoir-upload')?.click()}>
                      Parcourir
                    </Button>
                    <input 
                      type="file" 
                      id="devoir-upload" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && setDevoirFile(e.target.files[0])}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Button disabled={!devoirFile}>
              <Send className="w-4 h-4 mr-2" /> Soumettre le devoir
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <div>
              <h1 className="font-semibold">Maîtriser les Appels d'Offres</h1>
              <p className="text-sm text-muted-foreground">Par Expert Konan • Niveau Intermédiaire</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Progress value={progressPercent} className="w-32 h-2" />
                <span className="text-sm font-medium">{progressPercent}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Reste {remainingTime}</p>
            </div>
            <Button variant="outline" size="sm">
              <Award className="w-4 h-4 mr-2" /> Certificat
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar - Chapters */}
        <div className="w-80 border-r bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Programme du cours</h3>
            <p className="text-sm text-muted-foreground">{completedLessons}/{totalLessons} leçons terminées</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chapters.map((chapter, chIdx) => (
                <div key={chapter.id} className="mb-4">
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                    Chapitre {chIdx + 1}: {chapter.title}
                  </div>
                  {chapter.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.locked && setCurrentLesson(lesson)}
                      disabled={lesson.locked}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        currentLesson.id === lesson.id 
                          ? "bg-primary/10 text-primary" 
                          : lesson.locked 
                            ? "text-muted-foreground cursor-not-allowed" 
                            : "hover:bg-muted"
                      }`}
                    >
                      {getLessonIcon(lesson)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getLessonTypeIcon(lesson.type)}
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>

        {/* Right Panel */}
        <div className="w-96 border-l bg-card flex flex-col">
          <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as any)} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger value="notes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Notes
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Ressources
              </TabsTrigger>
              <TabsTrigger value="qa" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Q/R
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="flex-1 m-0 p-4">
              <Textarea 
                placeholder="Prenez vos notes ici..."
                className="h-full resize-none"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="resources" className="flex-1 m-0 overflow-auto">
              <div className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" /> Support de cours.pdf
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" /> Modèle offre technique.docx
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" /> Checklist documents.pdf
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" /> Exemples de soumissions.zip
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="flex-1 m-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {questions.map((q) => (
                    <Card key={q.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {q.author[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{q.author}</p>
                              <p className="text-xs text-muted-foreground">{q.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="w-3 h-3 mr-1" /> {q.upvotes}
                          </Button>
                        </div>
                        <p className="text-sm mb-3">{q.content}</p>
                        
                        {q.answers.map((a, idx) => (
                          <div key={idx} className="ml-4 pl-4 border-l-2 border-primary/20 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              {a.pinned && <Pin className="w-3 h-3 text-primary" />}
                              <span className="text-sm font-medium">{a.author}</span>
                              <span className="text-xs text-muted-foreground">{a.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{a.content}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Poser une question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <Button size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
