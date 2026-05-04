import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Users, Star, TrendingUp, DollarSign, Plus, Edit, Trash2,
  Send, Calendar, CheckCircle, Clock, Eye, Upload,
  Lock, Crown, BarChart3, MessageSquare, ImageIcon, FileVideo,
  MapPin, Globe, Phone, Mail, Award, GraduationCap, Video,
  PlayCircle, FileText, AlertCircle, Layers, ClipboardList, HelpCircle, ListChecks,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formationsApi, centreFormationsApi, formationModulesApi, formationCategoriesApi, formateursApi, chapitresApi, devoirsApi, quizApi, questionsApi, leconsApi, type CentreFormation, type FormationModule, type FormationCategorie, type FormateurAvecFormations, type FormationAPI, type FormationChapitre, type FormationLecon, type FormationDevoir, type FormationQuiz, type FormationQuestion } from "@/lib/api";

interface LessonDraft {
  id: string;
  titre: string;
  type_contenu: "video" | "pdf" | "texte";
  file: File | null;
  contenu: string;
}

type SubscriptionTier = "bronze" | "silver" | "gold" | "platine";

const subscriptionLimits: Record<SubscriptionTier, { courses: number; canMonetize: boolean; canCertify: boolean }> = {
  bronze: { courses: 0, canMonetize: false, canCertify: false },
  silver: { courses: 1, canMonetize: false, canCertify: false },
  gold: { courses: 5, canMonetize: true, canCertify: true },
  platine: { courses: -1, canMonetize: true, canCertify: true },
};

function courseStatus(f: FormationAPI): "draft" | "submitted" | "published" | "rejected" {
  if (f.isActive) return "published";
  return "draft";
}

export function EspaceFormateur() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState<FormationAPI[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [creationStep, setCreationStep] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [centres, setCentres] = useState<CentreFormation[]>([]);
  const [modules, setModules] = useState<FormationModule[]>([]);
  const [categories, setCategories] = useState<FormationCategorie[]>([]);
  const [formateurs, setFormateurs] = useState<FormateurAvecFormations[]>([]);

  const fetchCourses = () => {
    if (!user?.id) return;
    setCoursesLoading(true);
    formationsApi.getByCreator(user.id)
      .then(setCourses)
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  };

  useEffect(() => {
    centreFormationsApi.getAll().then(setCentres).catch(() => {});
    formationModulesApi.getAll().then(setModules).catch(() => {});
    formationCategoriesApi.getAll().then(setCategories).catch(() => {});
    if (user?.id) {
      formateursApi.getByCreator(user.id).then(setFormateurs).catch(() => {});
      fetchCourses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FormationAPI | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", category: "", mode: "", niveau: "",
    duration: "", moduleId: "", formateur_id: "",
    isPaid: false, isActive: false, price: "", price_member: "",
    image: null as File | null, fichier: null as File | null,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);
  const editFichierRef = useRef<HTMLInputElement>(null);

  const openEdit = (course: FormationAPI) => {
    setEditTarget(course);
    setEditForm({
      title:        course.title,
      description:  course.description ?? "",
      category:     course.category ?? "",
      mode:         course.mode ?? "",
      niveau:       course.niveau ?? "",
      duration:     course.duration ? String(course.duration) : "",
      moduleId:     "",
      formateur_id: course.formateur?.id ?? "",
      isPaid:       course.isPaid,
      isActive:     course.isActive,
      price:        course.price ? String(parseFloat(course.price)) : "",
      price_member: course.price_member ? String(parseFloat(course.price_member)) : "",
      image:        null,
      fichier:      null,
    });
    setEditError(null);
    setEditOpen(true);
  };

  const setEF = (key: string, value: unknown) => setEditForm((p) => ({ ...p, [key]: value }));

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await formationsApi.update(editTarget.id, {
        title:        editForm.title        || undefined,
        description:  editForm.description  || undefined,
        category:     editForm.category     || undefined,
        mode:         editForm.mode         || undefined,
        niveau:       editForm.niveau       || undefined,
        duration:     editForm.duration     ? Number(editForm.duration)     : undefined,
        isPaid:       editForm.isPaid,
        isActive:     editForm.isActive,
        price:        editForm.price        ? Number(editForm.price)        : undefined,
        price_member: editForm.price_member ? Number(editForm.price_member) : undefined,
        moduleId:     editForm.moduleId     || undefined,
        formateur_id: editForm.formateur_id || undefined,
        image:        editForm.image,
        fichier:      editForm.fichier,
      });
      setEditOpen(false);
      fetchCourses();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Erreur lors de la mise à jour");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFormation, setDetailFormation] = useState<FormationAPI | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailChapitres, setDetailChapitres] = useState<FormationChapitre[]>([]);
  const [detailDevoirs, setDetailDevoirs] = useState<FormationDevoir[]>([]);

  const openDetail = async (course: FormationAPI) => {
    setDetailFormation(course);
    setDetailChapitres([]);
    setDetailDevoirs([]);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const [full, chapitres, devoirs] = await Promise.all([
        formationsApi.getById(course.id),
        chapitresApi.getByFormation(course.id),
        devoirsApi.getByFormation(course.id),
      ]);
      setDetailFormation(full);
      setDetailChapitres(chapitres);
      setDetailDevoirs(devoirs);
    } catch {
      // garde les données de base déjà disponibles
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadDetailChapitres = () => {
    if (!detailFormation) return;
    chapitresApi.getByFormation(detailFormation.id)
      .then(setDetailChapitres)
      .catch(() => {});
  };

  const reloadDetailDevoirs = () => {
    if (!detailFormation) return;
    devoirsApi.getByFormation(detailFormation.id)
      .then(setDetailDevoirs)
      .catch(() => {});
  };

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<FormationAPI | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [coursesPage, setCoursesPage] = useState(1);
  const COURSES_PER_PAGE = 6;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await formationsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCourses();
    } catch {
      // garde le dialog ouvert, l'erreur est silencieuse (cas rare)
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Chapitre dialog ────────────────────────────────────────────────────────
  const [chapterOpen, setChapterOpen] = useState(false);
  const [chapterFormationId, setChapterFormationId] = useState("");
  const [chapterTitre, setChapterTitre] = useState("");
  const [chapterLecons, setChapterLecons] = useState<LessonDraft[]>([]);
  const [chapterSubmitting, setChapterSubmitting] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [chapterSuccess, setChapterSuccess] = useState(false);

  const openChapterDialog = (preselectedFormationId?: string) => {
    setChapterFormationId(preselectedFormationId ?? "");
    setChapterTitre("");
    setChapterLecons([]);
    setChapterError(null);
    setChapterSuccess(false);
    setChapterOpen(true);
  };

  const addLecon = () => {
    setChapterLecons((prev) => [...prev, {
      id: crypto.randomUUID(),
      titre: "",
      type_contenu: "video",
      file: null,
      contenu: "",
    }]);
  };

  const updateLecon = (id: string, updates: Partial<LessonDraft>) => {
    setChapterLecons((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLecon = (id: string) => {
    setChapterLecons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCreateChapter = async () => {
    if (!chapterFormationId || !chapterTitre.trim()) return;
    setChapterSubmitting(true);
    setChapterError(null);
    try {
      const leconsJson: Array<{ titre: string; type_contenu: string; fileField?: string; contenu?: string }> = [];
      const files: { [key: string]: File } = {};
      let fileIndex = 0;

      for (const lecon of chapterLecons) {
        if (!lecon.titre.trim()) continue;
        const entry: { titre: string; type_contenu: string; fileField?: string; contenu?: string } = {
          titre: lecon.titre,
          type_contenu: lecon.type_contenu,
        };
        if (lecon.type_contenu !== "texte" && lecon.file) {
          const fieldName = `leconFile_${fileIndex++}`;
          entry.fileField = fieldName;
          files[fieldName] = lecon.file;
        } else if (lecon.type_contenu === "texte" && lecon.contenu.trim()) {
          entry.contenu = lecon.contenu;
        }
        leconsJson.push(entry);
      }

      await chapitresApi.create({
        formation_id: chapterFormationId,
        titre: chapterTitre,
        lecons: leconsJson.length > 0 ? leconsJson : undefined,
        files: Object.keys(files).length > 0 ? files : undefined,
      });
      setChapterSuccess(true);
      fetchCourses();
    } catch (e: unknown) {
      setChapterError(e instanceof Error ? e.message : "Erreur lors de la création du chapitre");
    } finally {
      setChapterSubmitting(false);
    }
  };

  // ── Devoir dialog ──────────────────────────────────────────────────────────
  const [devoirOpen, setDevoirOpen] = useState(false);
  const [devoirFormationId, setDevoirFormationId] = useState("");
  const [devoirChapitreId, setDevoirChapitreId] = useState("");
  const [devoirLeconId, setDevoirLeconId] = useState("");
  const [devoirTitre, setDevoirTitre] = useState("");
  const [devoirDescription, setDevoirDescription] = useState("");
  const [devoirConsignes, setDevoirConsignes] = useState("");
  const [devoirDateLimite, setDevoirDateLimite] = useState("");
  const [devoirChapitres, setDevoirChapitres] = useState<FormationChapitre[]>([]);
  const [devoirChapitresLoading, setDevoirChapitresLoading] = useState(false);
  const [devoirSubmitting, setDevoirSubmitting] = useState(false);
  const [devoirError, setDevoirError] = useState<string | null>(null);
  const [devoirSuccess, setDevoirSuccess] = useState(false);

  const openDevoirDialog = (preselectedFormationId?: string) => {
    setDevoirFormationId(preselectedFormationId ?? "");
    setDevoirChapitreId("");
    setDevoirLeconId("");
    setDevoirTitre("");
    setDevoirDescription("");
    setDevoirConsignes("");
    setDevoirDateLimite("");
    setDevoirChapitres([]);
    setDevoirError(null);
    setDevoirSuccess(false);
    if (preselectedFormationId) {
      formationsApi.getById(preselectedFormationId)
        .then((f) => setDevoirChapitres(f.chapitres ?? []))
        .catch(() => {});
    }
    setDevoirOpen(true);
  };

  const handleDevoirFormationChange = (formationId: string) => {
    setDevoirFormationId(formationId);
    setDevoirChapitreId("");
    setDevoirLeconId("");
    setDevoirChapitres([]);
    setDevoirChapitresLoading(true);
    formationsApi.getById(formationId)
      .then((f) => setDevoirChapitres(f.chapitres ?? []))
      .catch(() => {})
      .finally(() => setDevoirChapitresLoading(false));
  };

  const devoirLecons: FormationLecon[] =
    devoirChapitreId
      ? (devoirChapitres.find((c) => c.id === devoirChapitreId)?.lecons ?? [])
      : [];

  const handleCreateDevoir = async () => {
    if (!devoirFormationId || !devoirTitre.trim()) return;
    setDevoirSubmitting(true);
    setDevoirError(null);
    try {
      await devoirsApi.create({
        titre: devoirTitre,
        description: devoirDescription || undefined,
        consignes: devoirConsignes || undefined,
        date_limite: devoirDateLimite || undefined,
        formation_id: devoirFormationId,
        chapitre_id: devoirChapitreId || undefined,
        lecon_id: devoirLeconId || undefined,
      });
      setDevoirSuccess(true);
    } catch (e: unknown) {
      setDevoirError(e instanceof Error ? e.message : "Erreur lors de la création du devoir");
    } finally {
      setDevoirSubmitting(false);
    }
  };

  // ── Quiz dialog ────────────────────────────────────────────────────────────
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizFormationId, setQuizFormationId] = useState("");
  const [quizChapitreId, setQuizChapitreId] = useState("");
  const [quizLeconId, setQuizLeconId] = useState("");
  const [quizTitre, setQuizTitre] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizChapitres, setQuizChapitres] = useState<FormationChapitre[]>([]);
  const [quizChapitresLoading, setQuizChapitresLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizSuccess, setQuizSuccess] = useState(false);
  // ── Quiz list/edit/delete ──
  const [quizListOpen, setQuizListOpen] = useState(false);
  const [quizListFormationId, setQuizListFormationId] = useState("");
  const [quizListItems, setQuizListItems] = useState<FormationQuiz[]>([]);
  const [quizListLoading, setQuizListLoading] = useState(false);
  const [quizEditTarget, setQuizEditTarget] = useState<FormationQuiz | null>(null);
  const [quizEditTitre, setQuizEditTitre] = useState("");
  const [quizEditDescription, setQuizEditDescription] = useState("");
  const [quizEditSubmitting, setQuizEditSubmitting] = useState(false);
  const [quizEditError, setQuizEditError] = useState<string | null>(null);
  const [quizDeleteTarget, setQuizDeleteTarget] = useState<FormationQuiz | null>(null);
  const [quizDeleteSubmitting, setQuizDeleteSubmitting] = useState(false);

  const openQuizDialog = (preselectedFormationId?: string) => {
    setQuizFormationId(preselectedFormationId ?? "");
    setQuizChapitreId("");
    setQuizLeconId("");
    setQuizTitre("");
    setQuizDescription("");
    setQuizChapitres([]);
    setQuizError(null);
    setQuizSuccess(false);
    if (preselectedFormationId) {
      formationsApi.getById(preselectedFormationId)
        .then((f) => setQuizChapitres(f.chapitres ?? []))
        .catch(() => {});
    }
    setQuizOpen(true);
  };

  const handleQuizFormationChange = (formationId: string) => {
    setQuizFormationId(formationId);
    setQuizChapitreId("");
    setQuizLeconId("");
    setQuizChapitres([]);
    setQuizChapitresLoading(true);
    formationsApi.getById(formationId)
      .then((f) => setQuizChapitres(f.chapitres ?? []))
      .catch(() => {})
      .finally(() => setQuizChapitresLoading(false));
  };

  const quizLecons: FormationLecon[] =
    quizChapitreId
      ? (quizChapitres.find((c) => c.id === quizChapitreId)?.lecons ?? [])
      : [];

  const handleCreateQuiz = async () => {
    if (!quizFormationId || !quizTitre.trim()) return;
    setQuizSubmitting(true);
    setQuizError(null);
    try {
      await quizApi.create({
        titre: quizTitre,
        description: quizDescription || undefined,
        formation_id: quizFormationId,
        chapitre_id: quizChapitreId && quizChapitreId !== "_none" ? quizChapitreId : undefined,
        lecon_id: quizLeconId && quizLeconId !== "_none" ? quizLeconId : undefined,
      });
      setQuizSuccess(true);
    } catch (e: unknown) {
      setQuizError(e instanceof Error ? e.message : "Erreur lors de la création du quiz");
    } finally {
      setQuizSubmitting(false);
    }
  };

  const openQuizList = (formationId: string) => {
    setQuizListFormationId(formationId);
    setQuizListItems([]);
    setQuizListLoading(true);
    setQuizListOpen(true);
    quizApi.getByFormation(formationId)
      .then(setQuizListItems)
      .catch(() => {})
      .finally(() => setQuizListLoading(false));
  };

  const handleQuizEditSave = async () => {
    if (!quizEditTarget || !quizEditTitre.trim()) return;
    setQuizEditSubmitting(true);
    setQuizEditError(null);
    try {
      const updated = await quizApi.update(quizEditTarget.id, {
        titre: quizEditTitre,
        description: quizEditDescription || undefined,
      });
      setQuizListItems((prev) => prev.map((q) => q.id === updated.id ? updated : q));
      setQuizEditTarget(null);
    } catch (e: unknown) {
      setQuizEditError(e instanceof Error ? e.message : "Erreur lors de la modification");
    } finally {
      setQuizEditSubmitting(false);
    }
  };

  const handleQuizDelete = async () => {
    if (!quizDeleteTarget) return;
    setQuizDeleteSubmitting(true);
    try {
      await quizApi.delete(quizDeleteTarget.id);
      setQuizListItems((prev) => prev.filter((q) => q.id !== quizDeleteTarget.id));
      setQuizDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setQuizDeleteSubmitting(false);
    }
  };

  // ── Questions dialog ────────────────────────────────────────────────────────
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionQuizId, setQuestionQuizId] = useState("");
  const [questionQuizTitre, setQuestionQuizTitre] = useState("");
  const [questionTexte, setQuestionTexte] = useState("");
  const [questionType, setQuestionType] = useState<"single_choice" | "multiple_choice">("single_choice");
  const [questionOptions, setQuestionOptions] = useState<string[]>(["", ""]);
  const [questionReponsesCorrectes, setQuestionReponsesCorrectes] = useState<number[]>([]);
  const [questionPoints, setQuestionPoints] = useState(1);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [questionSuccess, setQuestionSuccess] = useState(false);
  // Liste des questions d'un quiz
  const [questionListOpen, setQuestionListOpen] = useState(false);
  const [questionListQuizId, setQuestionListQuizId] = useState("");
  const [questionListQuizTitre, setQuestionListQuizTitre] = useState("");
  const [questionListItems, setQuestionListItems] = useState<FormationQuestion[]>([]);
  const [questionListLoading, setQuestionListLoading] = useState(false);
  const [questionDeleteTarget, setQuestionDeleteTarget] = useState<FormationQuestion | null>(null);
  const [questionDeleteSubmitting, setQuestionDeleteSubmitting] = useState(false);

  const openQuestionDialog = (quizId: string, quizTitre: string) => {
    setQuestionQuizId(quizId);
    setQuestionQuizTitre(quizTitre);
    setQuestionTexte("");
    setQuestionType("single_choice");
    setQuestionOptions(["", ""]);
    setQuestionReponsesCorrectes([]);
    setQuestionPoints(1);
    setQuestionError(null);
    setQuestionSuccess(false);
    setQuestionOpen(true);
  };

  const openQuestionList = (quizId: string, quizTitre: string) => {
    setQuestionListQuizId(quizId);
    setQuestionListQuizTitre(quizTitre);
    setQuestionListItems([]);
    setQuestionListLoading(true);
    setQuestionListOpen(true);
    questionsApi.getByQuiz(quizId)
      .then(setQuestionListItems)
      .catch(() => {})
      .finally(() => setQuestionListLoading(false));
  };

  const addQuestionOption = () => setQuestionOptions((prev) => [...prev, ""]);
  const removeQuestionOption = (idx: number) => {
    setQuestionOptions((prev) => prev.filter((_, i) => i !== idx));
    setQuestionReponsesCorrectes((prev) => {
      const updated = prev.filter((r) => r !== idx).map((r) => (r > idx ? r - 1 : r));
      return updated;
    });
  };
  const updateQuestionOption = (idx: number, val: string) => {
    setQuestionOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };
  const toggleReponseCorrecte = (idx: number) => {
    if (questionType === "single_choice") {
      setQuestionReponsesCorrectes([idx]);
    } else {
      setQuestionReponsesCorrectes((prev) =>
        prev.includes(idx) ? prev.filter((r) => r !== idx) : [...prev, idx]
      );
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionQuizId || !questionTexte.trim() || questionOptions.some((o) => !o.trim()) || questionReponsesCorrectes.length === 0) return;
    setQuestionSubmitting(true);
    setQuestionError(null);
    try {
      const created = await questionsApi.create({
        texte: questionTexte,
        type: questionType,
        options: questionOptions,
        reponses_correctes: questionReponsesCorrectes,
        points: questionPoints,
        quiz_id: questionQuizId,
        ordre: (questionListItems.length || 0) + 1,
      });
      setQuestionListItems((prev) => [...prev, created]);
      setQuestionSuccess(true);
    } catch (e: unknown) {
      setQuestionError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleQuestionDelete = async () => {
    if (!questionDeleteTarget) return;
    setQuestionDeleteSubmitting(true);
    try {
      await questionsApi.delete(questionDeleteTarget.id);
      setQuestionListItems((prev) => prev.filter((q) => q.id !== questionDeleteTarget.id));
      setQuestionDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setQuestionDeleteSubmitting(false);
    }
  };

  // ── Edit chapitre dialog ───────────────────────────────────────────────────
  const [editChapitreOpen, setEditChapitreOpen] = useState(false);
  const [editChapitreTarget, setEditChapitreTarget] = useState<FormationChapitre | null>(null);
  const [editChapitreTitre, setEditChapitreTitre] = useState("");
  const [editChapitreNewLecons, setEditChapitreNewLecons] = useState<LessonDraft[]>([]);
  const [editChapitreSubmitting, setEditChapitreSubmitting] = useState(false);
  const [editChapitreError, setEditChapitreError] = useState<string | null>(null);

  const openEditChapitre = (ch: FormationChapitre) => {
    setEditChapitreTarget(ch);
    setEditChapitreTitre(ch.titre);
    setEditChapitreNewLecons([]);
    setEditChapitreError(null);
    setEditChapitreOpen(true);
  };

  const addNewLeconToEdit = () => {
    setEditChapitreNewLecons((prev) => [...prev, {
      id: crypto.randomUUID(), titre: "", type_contenu: "video", file: null, contenu: "",
    }]);
  };

  const updateNewLecon = (id: string, updates: Partial<LessonDraft>) => {
    setEditChapitreNewLecons((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
  };

  const removeNewLecon = (id: string) => {
    setEditChapitreNewLecons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateChapitre = async () => {
    if (!editChapitreTarget || !editChapitreTitre.trim()) return;
    setEditChapitreSubmitting(true);
    setEditChapitreError(null);
    try {
      const leconsJson: Array<{ titre: string; type_contenu: string; fileField?: string; contenu?: string }> = [];
      const files: { [key: string]: File } = {};
      let fileIndex = 0;
      for (const lecon of editChapitreNewLecons) {
        if (!lecon.titre.trim()) continue;
        const entry: { titre: string; type_contenu: string; fileField?: string; contenu?: string } = {
          titre: lecon.titre, type_contenu: lecon.type_contenu,
        };
        if (lecon.type_contenu !== "texte" && lecon.file) {
          const fieldName = `leconFile_${fileIndex++}`;
          entry.fileField = fieldName;
          files[fieldName] = lecon.file;
        } else if (lecon.type_contenu === "texte" && lecon.contenu.trim()) {
          entry.contenu = lecon.contenu;
        }
        leconsJson.push(entry);
      }
      await chapitresApi.update(editChapitreTarget.id, {
        titre: editChapitreTitre,
        lecons: leconsJson.length > 0 ? leconsJson : undefined,
        files: Object.keys(files).length > 0 ? files : undefined,
      });
      setEditChapitreOpen(false);
      reloadDetailChapitres();
    } catch (e: unknown) {
      setEditChapitreError(e instanceof Error ? e.message : "Erreur lors de la mise à jour du chapitre");
    } finally {
      setEditChapitreSubmitting(false);
    }
  };

  // ── Delete chapitre ────────────────────────────────────────────────────────
  const [deleteChapitreTarget, setDeleteChapitreTarget] = useState<FormationChapitre | null>(null);
  const [deleteChapitreSubmitting, setDeleteChapitreSubmitting] = useState(false);

  const handleDeleteChapitre = async () => {
    if (!deleteChapitreTarget) return;
    setDeleteChapitreSubmitting(true);
    try {
      await chapitresApi.delete(deleteChapitreTarget.id);
      setDeleteChapitreTarget(null);
      reloadDetailChapitres();
    } catch {
      // garde le dialog ouvert
    } finally {
      setDeleteChapitreSubmitting(false);
    }
  };

  // ── Edit leçon dialog ─────────────────────────────────────────────────────
  const [editLeconOpen, setEditLeconOpen] = useState(false);
  const [editLeconTarget, setEditLeconTarget] = useState<FormationLecon | null>(null);
  const [editLeconTitre, setEditLeconTitre] = useState("");
  const [editLeconType, setEditLeconType] = useState<"video" | "pdf" | "texte">("video");
  const [editLeconContenu, setEditLeconContenu] = useState("");
  const [editLeconFile, setEditLeconFile] = useState<File | null>(null);
  const [editLeconSubmitting, setEditLeconSubmitting] = useState(false);
  const [editLeconError, setEditLeconError] = useState<string | null>(null);

  const [deleteLeconTarget, setDeleteLeconTarget] = useState<FormationLecon | null>(null);
  const [deleteLeconSubmitting, setDeleteLeconSubmitting] = useState(false);

  const handleDeleteLecon = async () => {
    if (!deleteLeconTarget) return;
    setDeleteLeconSubmitting(true);
    try {
      await leconsApi.delete(deleteLeconTarget.id);
      setDeleteLeconTarget(null);
      reloadDetailChapitres();
      // met aussi à jour la cible du dialog edit chapitre si ouvert
      if (editChapitreTarget) {
        setEditChapitreTarget((prev) =>
          prev ? { ...prev, lecons: prev.lecons.filter((l) => l.id !== deleteLeconTarget.id) } : prev
        );
      }
    } catch {
      // garde le dialog ouvert
    } finally {
      setDeleteLeconSubmitting(false);
    }
  };

  const openEditLecon = (lecon: FormationLecon) => {
    setEditLeconTarget(lecon);
    setEditLeconTitre(lecon.titre);
    setEditLeconType((lecon.type_contenu as "video" | "pdf" | "texte") ?? "video");
    setEditLeconContenu(lecon.type_contenu === "texte" ? lecon.contenu : "");
    setEditLeconFile(null);
    setEditLeconError(null);
    setEditLeconOpen(true);
  };

  const handleUpdateLecon = async () => {
    if (!editLeconTarget || !editLeconTitre.trim()) return;
    setEditLeconSubmitting(true);
    setEditLeconError(null);
    try {
      await leconsApi.update(editLeconTarget.id, {
        titre: editLeconTitre,
        type_contenu: editLeconType,
        chapitre_id: editLeconTarget.chapitre_id,
        file: editLeconType !== "texte" && editLeconFile ? editLeconFile : undefined,
      });
      setEditLeconOpen(false);
      reloadDetailChapitres();
    } catch (e: unknown) {
      setEditLeconError(e instanceof Error ? e.message : "Erreur lors de la mise à jour de la leçon");
    } finally {
      setEditLeconSubmitting(false);
    }
  };

  // ── Edit devoir dialog ─────────────────────────────────────────────────────
  const [editDevoirOpen, setEditDevoirOpen] = useState(false);
  const [editDevoirTarget, setEditDevoirTarget] = useState<FormationDevoir | null>(null);
  const [editDevoirTitre, setEditDevoirTitre] = useState("");
  const [editDevoirDescription, setEditDevoirDescription] = useState("");
  const [editDevoirConsignes, setEditDevoirConsignes] = useState("");
  const [editDevoirDateLimite, setEditDevoirDateLimite] = useState("");
  const [editDevoirChapitreId, setEditDevoirChapitreId] = useState("");
  const [editDevoirLeconId, setEditDevoirLeconId] = useState("");
  const [editDevoirChapitres, setEditDevoirChapitres] = useState<FormationChapitre[]>([]);
  const [editDevoirSubmitting, setEditDevoirSubmitting] = useState(false);
  const [editDevoirError, setEditDevoirError] = useState<string | null>(null);

  const openEditDevoir = (devoir: FormationDevoir) => {
    setEditDevoirTarget(devoir);
    setEditDevoirTitre(devoir.titre);
    setEditDevoirDescription(devoir.description ?? "");
    setEditDevoirConsignes(devoir.consignes ?? "");
    setEditDevoirDateLimite(devoir.date_limite ? devoir.date_limite.slice(0, 16) : "");
    setEditDevoirChapitreId(devoir.chapitre_id ?? "");
    setEditDevoirLeconId(devoir.lecon_id ?? "");
    setEditDevoirChapitres([]);
    setEditDevoirError(null);
    if (devoir.formation_id) {
      formationsApi.getById(devoir.formation_id)
        .then((f) => setEditDevoirChapitres(f.chapitres ?? []))
        .catch(() => {});
    }
    setEditDevoirOpen(true);
  };

  const editDevoirLecons: FormationLecon[] =
    editDevoirChapitreId
      ? (editDevoirChapitres.find((c) => c.id === editDevoirChapitreId)?.lecons ?? [])
      : [];

  const handleUpdateDevoir = async () => {
    if (!editDevoirTarget || !editDevoirTitre.trim()) return;
    setEditDevoirSubmitting(true);
    setEditDevoirError(null);
    try {
      await devoirsApi.update(editDevoirTarget.id, {
        titre: editDevoirTitre,
        description: editDevoirDescription || undefined,
        consignes: editDevoirConsignes || undefined,
        date_limite: editDevoirDateLimite || undefined,
        chapitre_id: editDevoirChapitreId || undefined,
        lecon_id: editDevoirLeconId || undefined,
      });
      setEditDevoirOpen(false);
      reloadDetailDevoirs();
    } catch (e: unknown) {
      setEditDevoirError(e instanceof Error ? e.message : "Erreur lors de la mise à jour du devoir");
    } finally {
      setEditDevoirSubmitting(false);
    }
  };

  // ── Delete devoir ──────────────────────────────────────────────────────────
  const [deleteDevoirTarget, setDeleteDevoirTarget] = useState<FormationDevoir | null>(null);
  const [deleteDevoirSubmitting, setDeleteDevoirSubmitting] = useState(false);

  const handleDeleteDevoir = async () => {
    if (!deleteDevoirTarget) return;
    setDeleteDevoirSubmitting(true);
    try {
      await devoirsApi.delete(deleteDevoirTarget.id);
      setDeleteDevoirTarget(null);
      reloadDetailDevoirs();
    } catch {
      // garde le dialog ouvert
    } finally {
      setDeleteDevoirSubmitting(false);
    }
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fichierInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    mode: "",
    niveau: "",
    duration: "",
    moduleId: "",
    formateur_id: "",
    centreFormationId: "",
    lien: "",
    date: "",
    isPaid: false,
    isActive: false,
    price: "",
    price_member: "",
    certification_delivrer_badge: false,
    certification_quiz_reussi: false,
    certification_progression_100: false,
    certification_devoir_valide: false,
    certification_presence_live: false,
    certification_nom_badge: "",
    image: null as File | null,
    fichier: null as File | null,
  });

  const setF = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  
  const subscriptionTier: SubscriptionTier = "gold";
  const limits = subscriptionLimits[subscriptionTier];
  const publishedCount = courses.filter(c => c.isActive).length;
  const canCreateMore = limits.courses === -1 || publishedCount < limits.courses;

  const totalLearners = courses.reduce((acc, c) => acc + (c.participants?.length ?? 0), 0);

  const getStatusBadge = (status: "draft" | "submitted" | "published" | "rejected") => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Brouillon</Badge>;
      case "submitted": return <Badge variant="outline" className="border-amber-500 text-amber-500">En validation</Badge>;
      case "published": return <Badge className="bg-green-500">Publié</Badge>;
      case "rejected": return <Badge variant="destructive">Rejeté</Badge>;
    }
  };

  const handleSubmitFormation = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await formationsApi.create({
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        mode: form.mode || undefined,
        niveau: form.niveau || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        isPaid: form.isPaid,
        isActive: form.isActive,
        price: form.price ? Number(form.price) : undefined,
        price_member: form.price_member ? Number(form.price_member) : undefined,
        moduleId: form.moduleId || undefined,
        formateur_id: form.formateur_id || undefined,
        centreFormationId: form.centreFormationId || undefined,
        lien: form.lien || undefined,
        date: form.date || undefined,
        certification_delivrer_badge: form.certification_delivrer_badge,
        certification_quiz_reussi: form.certification_quiz_reussi,
        certification_progression_100: form.certification_progression_100,
        certification_devoir_valide: form.certification_devoir_valide,
        certification_presence_live: form.certification_presence_live,
        certification_nom_badge: form.certification_nom_badge || undefined,
        image: form.image,
        fichier: form.fichier,
      });
      setSubmitSuccess(true);
      fetchCourses();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCreationWizard = () => (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-end gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === creationStep ? "bg-primary text-primary-foreground" :
              step < creationStep ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {step < creationStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
        ))}
      </div>

      {/* Étape 1 — Métadonnées */}
      {creationStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 1 : Informations générales</CardTitle>
            <CardDescription>Renseignez les informations de base de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="Ex: Maîtriser les marchés publics" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setF("description", e.target.value)} placeholder="Décrivez ce que les apprenants vont apprendre..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setF("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && <SelectItem value="_" disabled>Chargement…</SelectItem>}
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setF("mode", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir le mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_son_rythme">À son rythme (vidéo)</SelectItem>
                    <SelectItem value="webinaire">Webinaire / Live</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={form.niveau} onValueChange={(v) => setF("niveau", v)}>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (heures)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setF("duration", e.target.value)} placeholder="Ex: 10" min={0} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formateur</Label>
                <Select value={form.formateur_id} onValueChange={(v) => setF("formateur_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un formateur" /></SelectTrigger>
                  <SelectContent>
                    {formateurs.length === 0 && (
                      <SelectItem value="_" disabled>Aucun formateur trouvé</SelectItem>
                    )}
                    {formateurs.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.firstname} {f.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module lié</Label>
                <Select value={form.moduleId} onValueChange={(v) => setF("moduleId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
                  <SelectContent>
                    {modules.length === 0 && (
                      <SelectItem value="_" disabled>Chargement...</SelectItem>
                    )}
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date — visible pour tous les modes */}
            <div className="space-y-2">
              <Label>Date & heure de la formation</Label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setF("date", e.target.value)} />
            </div>

            {/* Champs conditionnels selon le mode */}
            {form.mode === "webinaire" && (
              <div className="space-y-2">
                <Label>Lien du webinaire</Label>
                <Input value={form.lien} onChange={(e) => setF("lien", e.target.value)} placeholder="https://zoom.us/..." />
              </div>
            )}
            {form.mode === "presentiel" && (
              <div className="space-y-2">
                <Label>Centre de formation</Label>
                <Select value={form.centreFormationId} onValueChange={(v) => setF("centreFormationId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un centre" /></SelectTrigger>
                  <SelectContent>
                    {centres.length === 0 && (
                      <SelectItem value="_" disabled>Chargement...</SelectItem>
                    )}
                    {centres.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nom} — {c.ville}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 2 — Médias */}
      {creationStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 2 : Médias</CardTitle>
            <CardDescription>Image de couverture et fichier vidéo/document principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image */}
            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <div
                className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {form.image ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{form.image.name}</span>
                    <span className="text-muted-foreground">({(form.image.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquer pour choisir une image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setF("image", e.target.files?.[0] ?? null)} />
            </div>

            {/* Fichier vidéo/document */}
            <div className="space-y-2">
              <Label>Fichier principal (vidéo ou document)</Label>
              <div
                className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fichierInputRef.current?.click()}
              >
                {form.fichier ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileVideo className="w-5 h-5 text-primary" />
                    <span className="font-medium">{form.fichier.name}</span>
                    <span className="text-muted-foreground">({(form.fichier.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquer pour choisir un fichier</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, PDF — max 500 Mo</p>
                  </>
                )}
              </div>
              <input ref={fichierInputRef} type="file" accept="video/*,.pdf" className="hidden"
                onChange={(e) => setF("fichier", e.target.files?.[0] ?? null)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3 — Certification */}
      {creationStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 3 : Certification</CardTitle>
            <CardDescription>Définissez les critères d'obtention du certificat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!limits.canCertify ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Fonctionnalité réservée Or+</span>
                </div>
                <p className="text-sm text-muted-foreground">Passez au plan Or pour proposer des certifications.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Délivrer un badge / certificat</Label>
                    <p className="text-sm text-muted-foreground">Activez pour proposer une certification</p>
                  </div>
                  <Switch checked={form.certification_delivrer_badge} onCheckedChange={(v) => setF("certification_delivrer_badge", v)} />
                </div>

                {form.certification_delivrer_badge && (
                  <>
                    <div className="space-y-2">
                      <Label>Nom du badge</Label>
                      <Input value={form.certification_nom_badge} onChange={(e) => setF("certification_nom_badge", e.target.value)} placeholder="Ex: Prêt AO" />
                    </div>
                    <div className="space-y-2">
                      <Label>Critères de réussite</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "certification_quiz_reussi", label: "Quiz réussi (min 70%)" },
                          { key: "certification_devoir_valide", label: "Devoir validé" },
                          { key: "certification_progression_100", label: "100% progression" },
                          { key: "certification_presence_live", label: "Présence live" },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-2">
                            <Switch checked={(form as Record<string, unknown>)[key] as boolean}
                              onCheckedChange={(v) => setF(key, v)} />
                            <span className="text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 4 — Tarification */}
      {creationStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 4 : Tarification</CardTitle>
            <CardDescription>Définissez le prix et la visibilité de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!limits.canMonetize ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Monétisation réservée Or+</span>
                </div>
                <p className="text-sm text-muted-foreground">Votre formation sera gratuite. Passez au plan Or pour la monétiser.</p>
                <Button variant="outline" size="sm" className="mt-2 rounded-sm">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Formation payante</Label>
                    <p className="text-sm text-muted-foreground">Désactivez pour rendre la formation gratuite</p>
                  </div>
                  <Switch checked={form.isPaid} onCheckedChange={(v) => setF("isPaid", v)} />
                </div>

                {form.isPaid && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prix public (FCFA)</Label>
                        <Input type="number" value={form.price} onChange={(e) => setF("price", e.target.value)} placeholder="25000" min={0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Prix membre (FCFA)</Label>
                        <Input type="number" value={form.price_member} onChange={(e) => setF("price_member", e.target.value)} placeholder="20000" min={0} />
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-sm text-sm">
                      <p className="font-medium mb-1">Commission CPU Academy</p>
                      <p className="text-muted-foreground">20% sur chaque vente. Vous recevez 80% du prix.</p>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 5 — Récapitulatif */}
      {creationStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 5 : Récapitulatif</CardTitle>
            <CardDescription>Vérifiez les informations avant de soumettre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submitSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
                <p className="font-semibold text-lg">Formation créée avec succès !</p>
                <p className="text-sm text-muted-foreground">Elle sera examinée par notre équipe sous 48h.</p>
                <Button onClick={() => { setCreateOpen(false); setSubmitSuccess(false); setCreationStep(1); }} className="rounded-sm">
                  Fermer
                </Button>
              </div>
            ) : (
              <>
                {[
                  { label: "Titre", value: form.title || "—" },
                  { label: "Catégorie", value: form.category || "—" },
                  { label: "Mode", value: form.mode || "—" },
                  { label: "Niveau", value: form.niveau || "—" },
                  { label: "Durée", value: form.duration ? `${form.duration}h` : "—" },
                  { label: "Image", value: form.image?.name || "—" },
                  { label: "Fichier", value: form.fichier?.name || "—" },
                  { label: "Certification", value: form.certification_delivrer_badge ? `Oui — ${form.certification_nom_badge || "sans nom"}` : "Non" },
                  { label: "Prix", value: form.isPaid ? `${form.price} FCFA (membre: ${form.price_member} FCFA)` : "Gratuit" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}

                {submitError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm">{submitError}</div>
                )}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200">
                  <p className="text-sm text-blue-600">
                    Votre formation sera examinée par notre équipe sous 48h. Vous serez notifié par email.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!submitSuccess && (
        <div className="flex justify-between">
          <Button variant="outline" className="rounded-sm"
            onClick={() => setCreationStep(Math.max(1, creationStep - 1))}
            disabled={creationStep === 1 || submitting}
          >
            Précédent
          </Button>
          {creationStep < 5 ? (
            <Button className="rounded-sm" disabled={creationStep === 1 && !form.title}
              onClick={() => setCreationStep(creationStep + 1)}
            >
              Suivant
            </Button>
          ) : (
            <Button className="rounded-sm gap-2" onClick={handleSubmitFormation} disabled={submitting}>
              {submitting ? <span className="animate-spin">⏳</span> : <Send className="w-4 h-4" />}
              {submitting ? "Envoi en cours..." : "Soumettre à validation"}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with subscription info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Espace Formateur
          </h2>
          <p className="text-muted-foreground">Créez et gérez vos formations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            Abonnement {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
          </Badge>
          {limits.courses !== -1 && (
            <span className="text-sm text-muted-foreground">
              {publishedCount}/{limits.courses} cours publiés
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" /> Mes cours
          </TabsTrigger>
          {/* <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="w-4 h-4" /> Sessions
          </TabsTrigger> */}
          <TabsTrigger value="evaluations" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Évaluations
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="w-4 h-4" /> Revenus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Cours publiés</span>
                </div>
                <p className="text-2xl font-bold">{coursesLoading ? "…" : publishedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Apprenants</span>
                </div>
                <p className="text-2xl font-bold">{coursesLoading ? "…" : totalLearners}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Total</span>
                </div>
                <p className="text-2xl font-bold">{coursesLoading ? "…" : courses.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Inactifs</span>
                </div>
                <p className="text-2xl font-bold">{coursesLoading ? "…" : courses.filter(c => !c.isActive).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Payantes</span>
                </div>
                <p className="text-2xl font-bold">{coursesLoading ? "…" : courses.filter(c => c.isPaid).length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cours récents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courses.length === 0 && !coursesLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune formation créée</p>
                )}
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.participants?.length ?? 0} apprenants</p>
                    </div>
                    {getStatusBadge(courseStatus(course))}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions en attente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">3 devoirs à corriger</span>
                  </div>
                  <Button size="sm" variant="outline">Voir</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">5 questions sans réponse</span>
                  </div>
                  <Button size="sm" variant="outline">Répondre</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Live demain 14h</span>
                  </div>
                  <Button size="sm" variant="outline">Préparer</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <Input placeholder="Rechercher un cours..." className="max-w-sm" />
              <Button onClick={() => { setCreationStep(1); setCreateOpen(true); }} disabled={!canCreateMore}>
                <Plus className="w-4 h-4 mr-2" /> Nouvelle formation
              </Button>
            </div>

            {/* Liste des formations */}
            {coursesLoading && (
              <p className="text-sm text-muted-foreground text-center py-6">Chargement…</p>
            )}
            {!coursesLoading && courses.length === 0 && (
              <Card className="rounded-sm">
                <CardContent className="py-12 text-center space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30" />
                  <p className="font-medium">Vous n'avez pas encore créé de formation.</p>
                  <Button size="sm" className="mt-2 gap-2" onClick={() => { setCreationStep(1); setCreateOpen(true); }}>
                    <Plus className="w-4 h-4" /> Créer ma première formation
                  </Button>
                </CardContent>
              </Card>
            )}
            {!coursesLoading && courses.length > 0 && (() => {
              const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
              const paginated = courses.slice((coursesPage - 1) * COURSES_PER_PAGE, coursesPage * COURSES_PER_PAGE);
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginated.map((course) => {
                      const status = courseStatus(course);
                      const learners = course.participants?.length ?? 0;
                      const chapitresCount = course.chapitres?.length ?? 0;
                      const price = course.price ? parseFloat(course.price) : 0;
                      return (
                        <Card key={course.id} className="rounded-sm flex flex-col">
                          <CardContent className="p-0 flex flex-col flex-1">
                            {/* Contenu principal */}
                            <div className="p-4 flex-1">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold leading-tight line-clamp-2">{course.title}</h3>
                                {getStatusBadge(status)}
                              </div>
                              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mt-3">
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 shrink-0" /> {learners} apprenant{learners > 1 ? "s" : ""}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 shrink-0" /> {chapitresCount} chapitre{chapitresCount > 1 ? "s" : ""}
                                </span>
                                {course.isPaid && price > 0 ? (
                                  <span className="flex items-center gap-1.5 text-primary font-medium">
                                    <DollarSign className="w-3.5 h-3.5 shrink-0" /> {price.toLocaleString()} FCFA
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-emerald-600">
                                    <Star className="w-3.5 h-3.5 shrink-0" /> Gratuit
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions icônes */}
                            <div className="border-t px-4 py-2 flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" title="Voir le détail" onClick={() => openDetail(course)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Modifier la formation" onClick={() => openEdit(course)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Supprimer" onClick={() => setDeleteTarget(course)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Barre d'actions contenu */}
                            <div className="border-t px-4 py-2 bg-muted/30 flex items-center gap-2 flex-wrap rounded-b-sm">
                              <span className="text-xs text-muted-foreground mr-1">Ajouter :</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1.5 rounded-sm"
                                onClick={() => openChapterDialog(course.id)}
                              >
                                <Layers className="w-3.5 h-3.5" />
                                Chapitre
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1.5 rounded-sm"
                                onClick={() => openDevoirDialog(course.id)}
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                Devoir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1.5 rounded-sm"
                                onClick={() => openQuizDialog(course.id)}
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                Quiz
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1.5 rounded-sm"
                                onClick={() => openQuizList(course.id)}
                              >
                                <ListChecks className="w-3.5 h-3.5" />
                                Voir quiz
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-muted-foreground">
                        Page {coursesPage} sur {totalPages} — {courses.length} formation{courses.length > 1 ? "s" : ""}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          disabled={coursesPage === 1}
                          onClick={() => setCoursesPage(p => p - 1)}
                        >
                          Précédent
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={page === coursesPage ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCoursesPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          disabled={coursesPage === totalPages}
                          onClick={() => setCoursesPage(p => p + 1)}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Planifier et gérer vos sessions live et présentielles</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Corriger les devoirs et publier les notes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Suivi des revenus et reversements</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawer Détail formation */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
          {detailLoading || !detailFormation ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-40 w-full rounded-sm" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              {/* Image */}
              {detailFormation.image ? (
                <div className="h-44 overflow-hidden flex-shrink-0">
                  <img src={detailFormation.image} alt={detailFormation.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-14 h-14 text-primary/20" />
                </div>
              )}

              <div className="p-5 space-y-5">
                <SheetHeader>
                  <SheetTitle className="text-lg leading-snug">{detailFormation.title}</SheetTitle>
                </SheetHeader>

                {/* Badges statut */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={detailFormation.isActive ? "bg-green-500" : ""} variant={detailFormation.isActive ? "default" : "secondary"}>
                    {detailFormation.isActive ? "Publié" : "Brouillon"}
                  </Badge>
                  {detailFormation.isPaid ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Payante
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600">Gratuite</Badge>
                  )}
                  {detailFormation.mode && (
                    <Badge variant="outline">
                      {detailFormation.mode === "a_son_rythme" ? <><Video className="w-3 h-3 mr-1" />À son rythme</> :
                       detailFormation.mode === "webinaire"    ? <><PlayCircle className="w-3 h-3 mr-1" />Webinaire</> :
                                                                  <><MapPin className="w-3 h-3 mr-1" />Présentiel</>}
                    </Badge>
                  )}
                  {detailFormation.niveau && (
                    <Badge variant="outline">
                      {detailFormation.niveau === "beginner" ? "Débutant" :
                       detailFormation.niveau === "intermediate" ? "Intermédiaire" : "Avancé"}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {detailFormation.description && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{detailFormation.description}</p>
                  </div>
                )}

                {/* Infos clés */}
                <div className="grid grid-cols-2 gap-3">
                  {detailFormation.duration > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{detailFormation.duration}h de formation</span>
                    </div>
                  )}
                  {detailFormation.date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(detailFormation.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  )}
                  {detailFormation.category && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span>{detailFormation.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{detailFormation.participants?.length ?? 0} participant{(detailFormation.participants?.length ?? 0) > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Prix */}
                {detailFormation.isPaid && (detailFormation.price || detailFormation.price_member) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />Tarification
                      </h3>
                      <div className="flex gap-4">
                        {detailFormation.price && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Public : </span>
                            <span className="font-semibold text-primary">{parseFloat(detailFormation.price).toLocaleString()} FCFA</span>
                          </div>
                        )}
                        {detailFormation.price_member && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Membre : </span>
                            <span className="font-semibold text-emerald-600">{parseFloat(detailFormation.price_member).toLocaleString()} FCFA</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Formateur */}
                {detailFormation.formateur && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />Formateur
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border">
                          {detailFormation.formateur.photo ? (
                            <img src={detailFormation.formateur.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <GraduationCap className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{detailFormation.formateur.firstname} {detailFormation.formateur.lastname}</p>
                          {detailFormation.formateur.titre && (
                            <p className="text-xs text-muted-foreground">{detailFormation.formateur.titre}</p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            {detailFormation.formateur.email && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />{detailFormation.formateur.email}
                              </span>
                            )}
                            {detailFormation.formateur.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />{detailFormation.formateur.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Centre de formation */}
                {detailFormation.centreFormation && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />Centre de formation
                      </h3>
                      <div className="text-sm space-y-0.5">
                        <p className="font-medium">{detailFormation.centreFormation.nom}</p>
                        <p className="text-muted-foreground">{detailFormation.centreFormation.adresse}, {detailFormation.centreFormation.ville}</p>
                        {detailFormation.centreFormation.telephone && (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />{detailFormation.centreFormation.telephone}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Lien webinaire */}
                {detailFormation.lien && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />Lien de session
                      </h3>
                      <a href={detailFormation.lien} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary underline break-all">{detailFormation.lien}</a>
                    </div>
                  </>
                )}

                {/* Certification */}
                {detailFormation.certification_delivrer_badge && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Certification {detailFormation.certification_nom_badge ? `— ${detailFormation.certification_nom_badge}` : ""}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detailFormation.certification_quiz_reussi && <Badge variant="secondary" className="text-xs">Quiz réussi</Badge>}
                        {detailFormation.certification_progression_100 && <Badge variant="secondary" className="text-xs">100% progression</Badge>}
                        {detailFormation.certification_devoir_valide && <Badge variant="secondary" className="text-xs">Devoir validé</Badge>}
                        {detailFormation.certification_presence_live && <Badge variant="secondary" className="text-xs">Présence live</Badge>}
                      </div>
                    </div>
                  </>
                )}

                {/* Chapitres — toujours visible, chargés via chapitresApi */}
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Chapitres ({detailChapitres.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 rounded-sm"
                      onClick={() => openChapterDialog(detailFormation.id)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                  </div>
                  {detailChapitres.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-sm">
                      Aucun chapitre pour l'instant
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {detailChapitres.map((ch, i) => (
                        <div key={ch.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-medium flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{ch.titre}</p>
                            {ch.lecons?.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {ch.lecons.length} leçon{ch.lecons.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="w-7 h-7" title="Modifier" onClick={() => openEditChapitre(ch)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" title="Supprimer" onClick={() => setDeleteChapitreTarget(ch)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Devoirs — toujours visible, chargés séparément */}
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      Devoirs ({detailDevoirs.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 rounded-sm"
                      onClick={() => openDevoirDialog(detailFormation.id)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                  </div>
                  {detailDevoirs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-sm">
                      Aucun devoir pour l'instant
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detailDevoirs.map((dv) => (
                        <div key={dv.id} className="flex items-start gap-2 p-2.5 bg-muted rounded-sm">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{dv.titre}</p>
                            {dv.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dv.description}</p>
                            )}
                            {dv.date_limite && (
                              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Limite : {new Date(dv.date_limite).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                            {dv.chapitre_id && (
                              <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {detailFormation.chapitres?.find(c => c.id === dv.chapitre_id)?.titre ?? "Chapitre lié"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="w-7 h-7" title="Modifier" onClick={() => openEditDevoir(dv)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" title="Supprimer" onClick={() => setDeleteDevoirTarget(dv)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compétences */}
                {detailFormation.competences?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />Compétences acquises
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detailFormation.competences.map((c, i) => (
                          <Badge key={i} variant="secondary" className="text-xs rounded-sm">
                            {typeof c === "string" ? c : (c as { label?: string }).label ?? ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Fichier principal */}
                {detailFormation.fichier && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-primary" />Fichier principal
                      </h3>
                      <a href={detailFormation.fichier} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="rounded-sm gap-2 text-xs">
                          <Eye className="w-3.5 h-3.5" /> Ouvrir le fichier
                        </Button>
                      </a>
                    </div>
                  </>
                )}

                {/* Date création */}
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Créée le {new Date(detailFormation.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog Confirmer suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer la formation
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">«&nbsp;{deleteTarget?.title}&nbsp;»</span> ?
            Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteTarget(null)} disabled={deleteSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {deleteSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier une formation */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Titre */}
            <div className="space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input value={editForm.title} onChange={(e) => setEF("title", e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEF("description", e.target.value)} rows={3} />
            </div>

            {/* Catégorie / Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={editForm.category} onValueChange={(v) => setEF("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && <SelectItem value="_" disabled>Chargement…</SelectItem>}
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={editForm.mode} onValueChange={(v) => setEF("mode", v)}>
                  <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_son_rythme">À son rythme</SelectItem>
                    <SelectItem value="webinaire">Webinaire / Live</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Niveau / Durée */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={editForm.niveau} onValueChange={(v) => setEF("niveau", v)}>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (heures)</Label>
                <Input type="number" value={editForm.duration} onChange={(e) => setEF("duration", e.target.value)} min={0} />
              </div>
            </div>

            {/* Formateur / Module */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formateur</Label>
                <Select value={editForm.formateur_id} onValueChange={(v) => setEF("formateur_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un formateur" /></SelectTrigger>
                  <SelectContent>
                    {formateurs.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.firstname} {f.lastname}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module lié</Label>
                <Select value={editForm.moduleId} onValueChange={(v) => setEF("moduleId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payant */}
            <div className="flex items-center justify-between border rounded-sm px-3 py-2">
              <Label>Payante</Label>
              <Switch checked={editForm.isPaid} onCheckedChange={(v) => setEF("isPaid", v)} />
            </div>

            {/* Prix */}
            {editForm.isPaid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix public (FCFA)</Label>
                  <Input type="number" value={editForm.price} onChange={(e) => setEF("price", e.target.value)} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>Prix membre (FCFA)</Label>
                  <Input type="number" value={editForm.price_member} onChange={(e) => setEF("price_member", e.target.value)} min={0} />
                </div>
              </div>
            )}

            {/* Image */}
            <div className="space-y-2">
              <Label>Nouvelle image de couverture (optionnel)</Label>
              <div className="border-2 border-dashed rounded-sm p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => editImageRef.current?.click()}>
                {editForm.image ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{editForm.image.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    <span>Cliquer pour changer l'image</span>
                  </div>
                )}
              </div>
              <input ref={editImageRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setEF("image", e.target.files?.[0] ?? null)} />
            </div>

            {/* Fichier */}
            <div className="space-y-2">
              <Label>Nouveau fichier principal (optionnel)</Label>
              <div className="border-2 border-dashed rounded-sm p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => editFichierRef.current?.click()}>
                {editForm.fichier ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileVideo className="w-4 h-4 text-primary" />
                    <span className="font-medium">{editForm.fichier.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    <span>Cliquer pour changer le fichier</span>
                  </div>
                )}
              </div>
              <input ref={editFichierRef} type="file" accept="video/*,.pdf" className="hidden"
                onChange={(e) => setEF("fichier", e.target.files?.[0] ?? null)} />
            </div>

            {editError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm">{editError}</div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-sm" onClick={() => setEditOpen(false)} disabled={editSubmitting}>
                Annuler
              </Button>
              <Button className="rounded-sm gap-2" onClick={handleEditSubmit}
                disabled={editSubmitting || !editForm.title}>
                {editSubmitting ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-4 h-4" />}
                {editSubmitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier un devoir */}
      <Dialog open={editDevoirOpen} onOpenChange={setEditDevoirOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Modifier le devoir
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Chapitre */}
            {editDevoirChapitres.length > 0 && (
              <div className="space-y-2">
                <Label>Chapitre <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                <Select
                  value={editDevoirChapitreId}
                  onValueChange={(v) => { setEditDevoirChapitreId(v === "_none" ? "" : v); setEditDevoirLeconId(""); }}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir un chapitre" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucun chapitre</SelectItem>
                    {editDevoirChapitres.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>{ch.titre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Leçon */}
            {editDevoirChapitreId && editDevoirLecons.length > 0 && (
              <div className="space-y-2">
                <Label>Leçon <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                <Select value={editDevoirLeconId} onValueChange={(v) => setEditDevoirLeconId(v === "_none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir une leçon" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucune leçon</SelectItem>
                    {editDevoirLecons.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.titre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Titre */}
            <div className="space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input value={editDevoirTitre} onChange={(e) => setEditDevoirTitre(e.target.value)} placeholder="Titre du devoir" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDevoirDescription} onChange={(e) => setEditDevoirDescription(e.target.value)} placeholder="Description…" rows={2} className="resize-none" />
            </div>

            {/* Consignes */}
            <div className="space-y-2">
              <Label>Consignes</Label>
              <Textarea value={editDevoirConsignes} onChange={(e) => setEditDevoirConsignes(e.target.value)} placeholder="Instructions pour les apprenants…" rows={3} className="resize-none" />
            </div>

            {/* Date limite */}
            <div className="space-y-2">
              <Label>Date limite</Label>
              <Input type="datetime-local" value={editDevoirDateLimite} onChange={(e) => setEditDevoirDateLimite(e.target.value)} />
            </div>

            {editDevoirError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{editDevoirError}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setEditDevoirOpen(false)} disabled={editDevoirSubmitting}>
              Annuler
            </Button>
            <Button className="rounded-sm gap-2" onClick={handleUpdateDevoir} disabled={editDevoirSubmitting || !editDevoirTitre.trim()}>
              {editDevoirSubmitting ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-4 h-4" />}
              {editDevoirSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmer suppression devoir */}
      <Dialog open={!!deleteDevoirTarget} onOpenChange={(open) => { if (!open) setDeleteDevoirTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer le devoir
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">«&nbsp;{deleteDevoirTarget?.titre}&nbsp;»</span> ?
            Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteDevoirTarget(null)} disabled={deleteDevoirSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleDeleteDevoir} disabled={deleteDevoirSubmitting}>
              {deleteDevoirSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {deleteDevoirSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Créer un devoir */}
      <Dialog open={devoirOpen} onOpenChange={setDevoirOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Créer un devoir
            </DialogTitle>
          </DialogHeader>

          {devoirSuccess ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle className="w-14 h-14 mx-auto text-emerald-500" />
              <p className="font-semibold text-lg">Devoir créé avec succès !</p>
              <p className="text-sm text-muted-foreground">Le devoir a bien été ajouté à la formation.</p>
              <Button className="rounded-sm" onClick={() => { setDevoirOpen(false); setDevoirSuccess(false); }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Formation */}
              <div className="space-y-2">
                <Label>Formation <span className="text-destructive">*</span></Label>
                <Select value={devoirFormationId} onValueChange={handleDevoirFormationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapitre (optionnel) */}
              {devoirFormationId && (
                <div className="space-y-2">
                  <Label>Chapitre <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                  <Select
                    value={devoirChapitreId}
                    onValueChange={(v) => { setDevoirChapitreId(v); setDevoirLeconId(""); }}
                    disabled={devoirChapitresLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoirChapitresLoading ? "Chargement…" : "Choisir un chapitre"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucun chapitre</SelectItem>
                      {devoirChapitres.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>{ch.titre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Leçon (optionnel, si chapitre sélectionné) */}
              {devoirChapitreId && devoirChapitreId !== "_none" && devoirLecons.length > 0 && (
                <div className="space-y-2">
                  <Label>Leçon <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                  <Select value={devoirLeconId} onValueChange={setDevoirLeconId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une leçon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucune leçon</SelectItem>
                      {devoirLecons.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.titre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Titre */}
              <div className="space-y-2">
                <Label>Titre <span className="text-destructive">*</span></Label>
                <Input
                  value={devoirTitre}
                  onChange={(e) => setDevoirTitre(e.target.value)}
                  placeholder="Ex: Devoir pratique sur NestJS"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={devoirDescription}
                  onChange={(e) => setDevoirDescription(e.target.value)}
                  placeholder="Décrivez l'objectif du devoir…"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Consignes */}
              <div className="space-y-2">
                <Label>Consignes</Label>
                <Textarea
                  value={devoirConsignes}
                  onChange={(e) => setDevoirConsignes(e.target.value)}
                  placeholder="Instructions détaillées pour les apprenants…"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Date limite */}
              <div className="space-y-2">
                <Label>Date limite</Label>
                <Input
                  type="datetime-local"
                  value={devoirDateLimite}
                  onChange={(e) => setDevoirDateLimite(e.target.value)}
                />
              </div>

              {devoirError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {devoirError}
                </div>
              )}
            </div>
          )}

          {!devoirSuccess && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-sm" onClick={() => setDevoirOpen(false)} disabled={devoirSubmitting}>
                Annuler
              </Button>
              <Button
                className="rounded-sm gap-2"
                onClick={handleCreateDevoir}
                disabled={devoirSubmitting || !devoirFormationId || !devoirTitre.trim()}
              >
                {devoirSubmitting ? <span className="animate-spin">⏳</span> : <ClipboardList className="w-4 h-4" />}
                {devoirSubmitting ? "Création en cours…" : "Créer le devoir"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmer suppression leçon */}
      <Dialog open={!!deleteLeconTarget} onOpenChange={(open) => { if (!open) setDeleteLeconTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer la leçon
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">«&nbsp;{deleteLeconTarget?.titre}&nbsp;»</span> ?
            Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteLeconTarget(null)} disabled={deleteLeconSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleDeleteLecon} disabled={deleteLeconSubmitting}>
              {deleteLeconSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {deleteLeconSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier une leçon */}
      <Dialog open={editLeconOpen} onOpenChange={setEditLeconOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Modifier la leçon
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input
                value={editLeconTitre}
                onChange={(e) => setEditLeconTitre(e.target.value)}
                placeholder="Titre de la leçon"
              />
            </div>

            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <Select
                value={editLeconType}
                onValueChange={(v: "video" | "pdf" | "texte") => {
                  setEditLeconType(v);
                  setEditLeconFile(null);
                  setEditLeconContenu("");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="texte">Texte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editLeconType !== "texte" && (
              <div className="space-y-2">
                <Label>Nouveau fichier <span className="text-xs font-normal text-muted-foreground">(optionnel — laissez vide pour garder l'actuel)</span></Label>
                <label className="flex items-center justify-center gap-2 border border-dashed rounded-sm p-3 cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
                  {editLeconFile ? (
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <FileVideo className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs">{editLeconFile.name}</span>
                      <span className="text-muted-foreground shrink-0">({(editLeconFile.size / 1024 / 1024).toFixed(1)} Mo)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-4 h-4" />
                      Cliquer pour choisir un fichier
                    </span>
                  )}
                  <input
                    type="file"
                    accept={editLeconType === "video" ? "video/*" : ".pdf,application/pdf"}
                    className="hidden"
                    onChange={(e) => setEditLeconFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            {editLeconType === "texte" && (
              <div className="space-y-2">
                <Label>Contenu texte</Label>
                <Textarea
                  value={editLeconContenu}
                  onChange={(e) => setEditLeconContenu(e.target.value)}
                  placeholder="Contenu de la leçon…"
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}

            {editLeconError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{editLeconError}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setEditLeconOpen(false)} disabled={editLeconSubmitting}>
              Annuler
            </Button>
            <Button
              className="rounded-sm gap-2"
              onClick={handleUpdateLecon}
              disabled={editLeconSubmitting || !editLeconTitre.trim()}
            >
              {editLeconSubmitting ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-4 h-4" />}
              {editLeconSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier un chapitre */}
      <Dialog open={editChapitreOpen} onOpenChange={setEditChapitreOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Modifier le chapitre
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Titre */}
            <div className="space-y-2">
              <Label>Titre du chapitre <span className="text-destructive">*</span></Label>
              <Input
                value={editChapitreTitre}
                onChange={(e) => setEditChapitreTitre(e.target.value)}
                placeholder="Ex: Introduction à NestJS"
              />
            </div>

            {/* Leçons existantes */}
            {editChapitreTarget?.lecons && editChapitreTarget.lecons.length > 0 && (
              <div className="space-y-2">
                <Label>Leçons existantes</Label>
                <div className="space-y-1.5">
                  {editChapitreTarget.lecons.map((lecon) => (
                    <div
                      key={lecon.id}
                      className="flex items-center gap-2 p-2.5 rounded-sm border bg-muted/30 text-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{lecon.titre}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-sm shrink-0">
                        {lecon.type_contenu}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 shrink-0"
                        onClick={() => openEditLecon(lecon)}
                        title="Modifier la leçon"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteLeconTarget(lecon)}
                        title="Supprimer la leçon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles leçons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ajouter des leçons <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-sm h-7 text-xs" onClick={addNewLeconToEdit}>
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </div>

              {editChapitreNewLecons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 border border-dashed rounded-sm">
                  Cliquez sur « Ajouter » pour inclure de nouvelles leçons
                </p>
              ) : (
                <div className="space-y-3">
                  {editChapitreNewLecons.map((lecon, index) => (
                    <div key={lecon.id} className="border rounded-sm p-3 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Nouvelle leçon {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-destructive hover:text-destructive"
                          onClick={() => removeNewLecon(lecon.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Titre</Label>
                          <Input
                            value={lecon.titre}
                            onChange={(e) => updateNewLecon(lecon.id, { titre: e.target.value })}
                            placeholder="Titre de la leçon"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Type de contenu</Label>
                          <Select
                            value={lecon.type_contenu}
                            onValueChange={(v: "video" | "pdf" | "texte") =>
                              updateNewLecon(lecon.id, { type_contenu: v, file: null, contenu: "" })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Vidéo</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="texte">Texte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {lecon.type_contenu !== "texte" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Fichier {lecon.type_contenu === "video" ? "(MP4, MOV…)" : "(PDF)"}
                          </Label>
                          <label className="flex items-center justify-center gap-2 border border-dashed rounded-sm p-2.5 cursor-pointer hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
                            {lecon.file ? (
                              <span className="flex items-center gap-1.5 text-foreground font-medium">
                                <FileVideo className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate max-w-xs">{lecon.file.name}</span>
                                <span className="text-muted-foreground shrink-0">
                                  ({(lecon.file.size / 1024 / 1024).toFixed(1)} Mo)
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" />
                                Cliquer pour choisir un fichier
                              </span>
                            )}
                            <input
                              type="file"
                              accept={lecon.type_contenu === "video" ? "video/*" : ".pdf,application/pdf"}
                              className="hidden"
                              onChange={(e) => updateNewLecon(lecon.id, { file: e.target.files?.[0] ?? null })}
                            />
                          </label>
                        </div>
                      )}

                      {lecon.type_contenu === "texte" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Contenu texte</Label>
                          <Textarea
                            value={lecon.contenu}
                            onChange={(e) => updateNewLecon(lecon.id, { contenu: e.target.value })}
                            placeholder="Saisissez le contenu de la leçon…"
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editChapitreError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{editChapitreError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setEditChapitreOpen(false)} disabled={editChapitreSubmitting}>
              Annuler
            </Button>
            <Button
              className="rounded-sm gap-2"
              onClick={handleUpdateChapitre}
              disabled={editChapitreSubmitting || !editChapitreTitre.trim()}
            >
              {editChapitreSubmitting ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-4 h-4" />}
              {editChapitreSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmer suppression chapitre */}
      <Dialog open={!!deleteChapitreTarget} onOpenChange={(open) => { if (!open) setDeleteChapitreTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer le chapitre
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">«&nbsp;{deleteChapitreTarget?.titre}&nbsp;»</span> ?
            Toutes les leçons associées seront également supprimées. Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setDeleteChapitreTarget(null)} disabled={deleteChapitreSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleDeleteChapitre} disabled={deleteChapitreSubmitting}>
              {deleteChapitreSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {deleteChapitreSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Créer un chapitre */}
      <Dialog open={chapterOpen} onOpenChange={setChapterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Créer un chapitre
            </DialogTitle>
          </DialogHeader>

          {chapterSuccess ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle className="w-14 h-14 mx-auto text-emerald-500" />
              <p className="font-semibold text-lg">Chapitre créé avec succès !</p>
              <p className="text-sm text-muted-foreground">Le chapitre a bien été ajouté à la formation.</p>
              <Button className="rounded-sm" onClick={() => { setChapterOpen(false); setChapterSuccess(false); }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {/* Formation */}
              <div className="space-y-2">
                <Label>Formation <span className="text-destructive">*</span></Label>
                <Select value={chapterFormationId} onValueChange={setChapterFormationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 && (
                      <SelectItem value="_" disabled>Aucune formation créée</SelectItem>
                    )}
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Titre du chapitre */}
              <div className="space-y-2">
                <Label>Titre du chapitre <span className="text-destructive">*</span></Label>
                <Input
                  value={chapterTitre}
                  onChange={(e) => setChapterTitre(e.target.value)}
                  placeholder="Ex: Introduction à NestJS"
                />
              </div>

              {/* Leçons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Leçons <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-sm h-7 text-xs" onClick={addLecon}>
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une leçon
                  </Button>
                </div>

                {chapterLecons.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-sm">
                    Aucune leçon — vous pourrez en ajouter après la création
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chapterLecons.map((lecon, index) => (
                      <div key={lecon.id} className="border rounded-sm p-3 space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Leçon {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-destructive hover:text-destructive"
                            onClick={() => removeLecon(lecon.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Titre</Label>
                            <Input
                              value={lecon.titre}
                              onChange={(e) => updateLecon(lecon.id, { titre: e.target.value })}
                              placeholder="Titre de la leçon"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Type de contenu</Label>
                            <Select
                              value={lecon.type_contenu}
                              onValueChange={(v: "video" | "pdf" | "texte") =>
                                updateLecon(lecon.id, { type_contenu: v, file: null, contenu: "" })
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Vidéo</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="texte">Texte</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {lecon.type_contenu !== "texte" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Fichier {lecon.type_contenu === "video" ? "(MP4, MOV…)" : "(PDF)"}
                            </Label>
                            <label className="flex items-center justify-center gap-2 border border-dashed rounded-sm p-2.5 cursor-pointer hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
                              {lecon.file ? (
                                <span className="flex items-center gap-1.5 text-foreground font-medium">
                                  <FileVideo className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="truncate max-w-xs">{lecon.file.name}</span>
                                  <span className="text-muted-foreground shrink-0">
                                    ({(lecon.file.size / 1024 / 1024).toFixed(1)} Mo)
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <Upload className="w-3.5 h-3.5" />
                                  Cliquer pour choisir un fichier
                                </span>
                              )}
                              <input
                                type="file"
                                accept={lecon.type_contenu === "video" ? "video/*" : ".pdf,application/pdf"}
                                className="hidden"
                                onChange={(e) => updateLecon(lecon.id, { file: e.target.files?.[0] ?? null })}
                              />
                            </label>
                          </div>
                        )}

                        {lecon.type_contenu === "texte" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Contenu texte</Label>
                            <Textarea
                              value={lecon.contenu}
                              onChange={(e) => updateLecon(lecon.id, { contenu: e.target.value })}
                              placeholder="Saisissez le contenu de la leçon…"
                              rows={3}
                              className="text-sm resize-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {chapterError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {chapterError}
                </div>
              )}
            </div>
          )}

          {!chapterSuccess && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-sm" onClick={() => setChapterOpen(false)} disabled={chapterSubmitting}>
                Annuler
              </Button>
              <Button
                className="rounded-sm gap-2"
                onClick={handleCreateChapter}
                disabled={chapterSubmitting || !chapterFormationId || !chapterTitre.trim()}
              >
                {chapterSubmitting ? <span className="animate-spin">⏳</span> : <Layers className="w-4 h-4" />}
                {chapterSubmitting ? "Création en cours…" : "Créer le chapitre"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une formation</DialogTitle>
          </DialogHeader>
          {canCreateMore ? renderCreationWizard() : (
            <div className="p-4 text-center space-y-4">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Limite atteinte</h3>
              <p className="text-muted-foreground">
                Vous avez atteint le nombre maximum de cours pour votre abonnement {subscriptionTier}.
              </p>
              <Button>
                <Crown className="w-4 h-4 mr-2" /> Passer au plan supérieur
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Créer un quiz */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Créer un quiz
            </DialogTitle>
          </DialogHeader>

          {quizSuccess ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle className="w-14 h-14 mx-auto text-emerald-500" />
              <p className="font-semibold text-lg">Quiz créé avec succès !</p>
              <p className="text-sm text-muted-foreground">Le quiz a bien été ajouté à la formation.</p>
              <Button className="rounded-sm" onClick={() => { setQuizOpen(false); setQuizSuccess(false); }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Formation */}
              <div className="space-y-2">
                <Label>Formation <span className="text-destructive">*</span></Label>
                <Select value={quizFormationId} onValueChange={handleQuizFormationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapitre (optionnel) */}
              {quizFormationId && (
                <div className="space-y-2">
                  <Label>Chapitre <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                  <Select
                    value={quizChapitreId}
                    onValueChange={(v) => { setQuizChapitreId(v); setQuizLeconId(""); }}
                    disabled={quizChapitresLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={quizChapitresLoading ? "Chargement…" : "Choisir un chapitre"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucun chapitre</SelectItem>
                      {quizChapitres.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>{ch.titre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Leçon (optionnel) */}
              {quizChapitreId && quizChapitreId !== "_none" && quizLecons.length > 0 && (
                <div className="space-y-2">
                  <Label>Leçon <span className="text-xs font-normal text-muted-foreground">(optionnel)</span></Label>
                  <Select value={quizLeconId} onValueChange={setQuizLeconId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une leçon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucune leçon</SelectItem>
                      {quizLecons.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.titre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Titre */}
              <div className="space-y-2">
                <Label>Titre <span className="text-destructive">*</span></Label>
                <Input
                  value={quizTitre}
                  onChange={(e) => setQuizTitre(e.target.value)}
                  placeholder="Ex: Quiz sur les bases de NestJS"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Décrivez l'objectif du quiz…"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {quizError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {quizError}
                </div>
              )}
            </div>
          )}

          {!quizSuccess && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-sm" onClick={() => setQuizOpen(false)} disabled={quizSubmitting}>
                Annuler
              </Button>
              <Button
                className="rounded-sm gap-2"
                onClick={handleCreateQuiz}
                disabled={quizSubmitting || !quizFormationId || !quizTitre.trim()}
              >
                {quizSubmitting ? <span className="animate-spin">⏳</span> : <HelpCircle className="w-4 h-4" />}
                {quizSubmitting ? "Création en cours…" : "Créer le quiz"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Liste des quiz */}
      <Dialog open={quizListOpen} onOpenChange={setQuizListOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Quiz de la formation
            </DialogTitle>
          </DialogHeader>

          {quizListLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chargement…</p>
          ) : quizListItems.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aucun quiz pour cette formation.</p>
              <Button size="sm" className="gap-2 mt-2" onClick={() => { setQuizListOpen(false); openQuizDialog(quizListFormationId); }}>
                <Plus className="w-4 h-4" /> Créer un quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {quizListItems.map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-3 p-3 border rounded-sm">
                  {quizEditTarget?.id === q.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={quizEditTitre}
                        onChange={(e) => setQuizEditTitre(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Textarea
                        value={quizEditDescription}
                        onChange={(e) => setQuizEditDescription(e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                        placeholder="Description…"
                      />
                      {quizEditError && (
                        <p className="text-xs text-destructive">{quizEditError}</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs rounded-sm gap-1" onClick={handleQuizEditSave} disabled={quizEditSubmitting}>
                          <CheckCircle className="w-3 h-3" />
                          {quizEditSubmitting ? "Enregistrement…" : "Enregistrer"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs rounded-sm" onClick={() => setQuizEditTarget(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{q.titre}</p>
                      {q.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{q.description}</p>
                      )}
                    </div>
                  )}
                  {quizEditTarget?.id !== q.id && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" title="Questions" onClick={() => { setQuizListOpen(false); openQuestionList(q.id, q.titre); }}>
                        <HelpCircle className="w-3.5 h-3.5" />
                        Questions
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Modifier" onClick={() => {
                        setQuizEditTarget(q);
                        setQuizEditTitre(q.titre);
                        setQuizEditDescription(q.description ?? "");
                        setQuizEditError(null);
                      }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Supprimer" onClick={() => setQuizDeleteTarget(q)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="rounded-sm" onClick={() => setQuizListOpen(false)}>Fermer</Button>
            <Button className="rounded-sm gap-2" onClick={() => { setQuizListOpen(false); openQuizDialog(quizListFormationId); }}>
              <Plus className="w-4 h-4" /> Nouveau quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmer suppression quiz */}
      <Dialog open={!!quizDeleteTarget} onOpenChange={(open) => { if (!open) setQuizDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer le quiz
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer <span className="font-semibold text-foreground">«&nbsp;{quizDeleteTarget?.titre}&nbsp;»</span> ?
            Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setQuizDeleteTarget(null)} disabled={quizDeleteSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleQuizDelete} disabled={quizDeleteSubmitting}>
              {quizDeleteSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {quizDeleteSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Liste des questions d'un quiz */}
      <Dialog open={questionListOpen} onOpenChange={setQuestionListOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Questions — {questionListQuizTitre}
            </DialogTitle>
          </DialogHeader>

          {questionListLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chargement…</p>
          ) : questionListItems.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aucune question pour ce quiz.</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {questionListItems.map((q, idx) => (
                <div key={q.id} className="border rounded-sm p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Q{idx + 1}. {q.texte}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {q.type === "single_choice" ? "Choix unique" : "Choix multiple"}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.points} pt{q.points > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0" title="Supprimer" onClick={() => setQuestionDeleteTarget(q)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${q.reponses_correctes.includes(i) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium" : "bg-muted text-muted-foreground"}`}>
                        {q.reponses_correctes.includes(i) ? <CheckCircle className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 shrink-0 inline-block" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="rounded-sm" onClick={() => setQuestionListOpen(false)}>Fermer</Button>
            <Button className="rounded-sm gap-2" onClick={() => { setQuestionListOpen(false); openQuestionDialog(questionListQuizId, questionListQuizTitre); }}>
              <Plus className="w-4 h-4" /> Ajouter une question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Créer une question */}
      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Ajouter une question — {questionQuizTitre}
            </DialogTitle>
          </DialogHeader>

          {questionSuccess ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle className="w-14 h-14 mx-auto text-emerald-500" />
              <p className="font-semibold text-lg">Question ajoutée !</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" className="rounded-sm" onClick={() => { setQuestionSuccess(false); }}>
                  Ajouter une autre
                </Button>
                <Button className="rounded-sm" onClick={() => { setQuestionOpen(false); openQuestionList(questionQuizId, questionQuizTitre); }}>
                  Voir les questions
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Type */}
              <div className="space-y-2">
                <Label>Type de question <span className="text-destructive">*</span></Label>
                <Select value={questionType} onValueChange={(v) => { setQuestionType(v as "single_choice" | "multiple_choice"); setQuestionReponsesCorrectes([]); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Choix unique (une seule bonne réponse)</SelectItem>
                    <SelectItem value="multiple_choice">Choix multiple (plusieurs bonnes réponses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Texte de la question */}
              <div className="space-y-2">
                <Label>Question <span className="text-destructive">*</span></Label>
                <Textarea
                  value={questionTexte}
                  onChange={(e) => setQuestionTexte(e.target.value)}
                  placeholder="Quelle est la syntaxe correcte pour…"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Options de réponse */}
              <div className="space-y-2">
                <Label>Options de réponse <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground">
                  {questionType === "single_choice" ? "Cliquez sur une option pour la marquer comme correcte." : "Cliquez sur les options correctes (plusieurs possibles)."}
                </p>
                <div className="space-y-2">
                  {questionOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleReponseCorrecte(idx)}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          questionReponsesCorrectes.includes(idx)
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-muted-foreground/30 hover:border-emerald-400"
                        }`}
                        title="Marquer comme réponse correcte"
                      >
                        {questionReponsesCorrectes.includes(idx) && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => updateQuestionOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 h-8 text-sm"
                      />
                      {questionOptions.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => removeQuestionOption(idx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-sm" onClick={addQuestionOption}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter une option
                </Button>
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 h-8"
                />
              </div>

              {questionError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {questionError}
                </div>
              )}
              {questionReponsesCorrectes.length === 0 && questionTexte.trim() && (
                <p className="text-xs text-amber-600">Sélectionnez au moins une réponse correcte.</p>
              )}
            </div>
          )}

          {!questionSuccess && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-sm" onClick={() => setQuestionOpen(false)} disabled={questionSubmitting}>
                Annuler
              </Button>
              <Button
                className="rounded-sm gap-2"
                onClick={handleCreateQuestion}
                disabled={
                  questionSubmitting ||
                  !questionTexte.trim() ||
                  questionOptions.some((o) => !o.trim()) ||
                  questionReponsesCorrectes.length === 0
                }
              >
                {questionSubmitting ? <span className="animate-spin">⏳</span> : <Plus className="w-4 h-4" />}
                {questionSubmitting ? "Ajout en cours…" : "Ajouter la question"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmer suppression question */}
      <Dialog open={!!questionDeleteTarget} onOpenChange={(open) => { if (!open) setQuestionDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Supprimer la question
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous vraiment supprimer cette question ? Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-sm" onClick={() => setQuestionDeleteTarget(null)} disabled={questionDeleteSubmitting}>
              Annuler
            </Button>
            <Button variant="destructive" className="rounded-sm gap-2" onClick={handleQuestionDelete} disabled={questionDeleteSubmitting}>
              {questionDeleteSubmitting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
              {questionDeleteSubmitting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
