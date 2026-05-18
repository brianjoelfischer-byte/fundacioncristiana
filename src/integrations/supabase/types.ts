export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          employee_id: string
          fecha_vencimiento: string | null
          file_path: string
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["document_type"]
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          fecha_vencimiento?: string | null
          file_path: string
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["document_type"]
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          fecha_vencimiento?: string | null
          file_path?: string
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["document_type"]
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          apellido: string
          avatar_url: string | null
          cargo: string | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_telefono: string | null
          created_at: string
          department_id: string | null
          dias_vacaciones_disponibles: number
          direccion: string | null
          dni: string | null
          email: string
          estado: Database["public"]["Enums"]["employee_status"]
          fecha_ingreso: string | null
          fecha_nacimiento: string | null
          id: string
          jornada_laboral: string | null
          legajo: string | null
          nombre: string
          supervisor_id: string | null
          telefono: string | null
          tipo_contrato: Database["public"]["Enums"]["contract_type"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apellido: string
          avatar_url?: string | null
          cargo?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string
          department_id?: string | null
          dias_vacaciones_disponibles?: number
          direccion?: string | null
          dni?: string | null
          email: string
          estado?: Database["public"]["Enums"]["employee_status"]
          fecha_ingreso?: string | null
          fecha_nacimiento?: string | null
          id?: string
          jornada_laboral?: string | null
          legajo?: string | null
          nombre: string
          supervisor_id?: string | null
          telefono?: string | null
          tipo_contrato?: Database["public"]["Enums"]["contract_type"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apellido?: string
          avatar_url?: string | null
          cargo?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string
          department_id?: string | null
          dias_vacaciones_disponibles?: number
          direccion?: string | null
          dni?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["employee_status"]
          fecha_ingreso?: string | null
          fecha_nacimiento?: string | null
          id?: string
          jornada_laboral?: string | null
          legajo?: string | null
          nombre?: string
          supervisor_id?: string | null
          telefono?: string | null
          tipo_contrato?: Database["public"]["Enums"]["contract_type"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          tipo: string | null
          titulo: string
          ubicacion: string | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          tipo?: string | null
          titulo: string
          ubicacion?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          tipo?: string | null
          titulo?: string
          ubicacion?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          categoria: Database["public"]["Enums"]["news_category"]
          contenido: string
          created_at: string
          destacado: boolean
          id: string
          imagen_url: string | null
          titulo: string
        }
        Insert: {
          author_id?: string | null
          categoria?: Database["public"]["Enums"]["news_category"]
          contenido: string
          created_at?: string
          destacado?: boolean
          id?: string
          imagen_url?: string | null
          titulo: string
        }
        Update: {
          author_id?: string | null
          categoria?: Database["public"]["Enums"]["news_category"]
          contenido?: string
          created_at?: string
          destacado?: boolean
          id?: string
          imagen_url?: string | null
          titulo?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          leida: boolean
          link: string | null
          mensaje: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leida?: boolean
          link?: string | null
          mensaje: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leida?: boolean
          link?: string | null
          mensaje?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      payslips: {
        Row: {
          concepto: string | null
          created_at: string
          employee_id: string
          file_path: string
          id: string
          monto: number | null
          periodo_anio: number
          periodo_mes: number
          uploaded_by: string | null
        }
        Insert: {
          concepto?: string | null
          created_at?: string
          employee_id: string
          file_path: string
          id?: string
          monto?: number | null
          periodo_anio: number
          periodo_mes: number
          uploaded_by?: string | null
        }
        Update: {
          concepto?: string | null
          created_at?: string
          employee_id?: string
          file_path?: string
          id?: string
          monto?: number | null
          periodo_anio?: number
          periodo_mes?: number
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          archivo_url: string | null
          comentario_rrhh: string | null
          created_at: string
          employee_id: string
          estado: Database["public"]["Enums"]["request_status"]
          fecha_desde: string
          fecha_hasta: string | null
          id: string
          motivo: string
          reviewed_at: string | null
          reviewed_by: string | null
          tipo: Database["public"]["Enums"]["request_type"]
        }
        Insert: {
          archivo_url?: string | null
          comentario_rrhh?: string | null
          created_at?: string
          employee_id: string
          estado?: Database["public"]["Enums"]["request_status"]
          fecha_desde: string
          fecha_hasta?: string | null
          id?: string
          motivo: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          tipo: Database["public"]["Enums"]["request_type"]
        }
        Update: {
          archivo_url?: string | null
          comentario_rrhh?: string | null
          created_at?: string
          employee_id?: string
          estado?: Database["public"]["Enums"]["request_status"]
          fecha_desde?: string
          fecha_hasta?: string | null
          id?: string
          motivo?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          tipo?: Database["public"]["Enums"]["request_type"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          asunto: string
          categoria: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          descripcion: string
          employee_id: string
          estado: Database["public"]["Enums"]["ticket_status"]
          id: string
          responded_at: string | null
          responded_by: string | null
          respuesta: string | null
        }
        Insert: {
          asunto: string
          categoria: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          descripcion: string
          employee_id: string
          estado?: Database["public"]["Enums"]["ticket_status"]
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          respuesta?: string | null
        }
        Update: {
          asunto?: string
          categoria?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          descripcion?: string
          employee_id?: string
          estado?: Database["public"]["Enums"]["ticket_status"]
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          respuesta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin_rrhh" | "empleado"
      contract_type:
        | "planta_permanente"
        | "contrato"
        | "monotributo"
        | "pasantia"
        | "suplente"
      document_type:
        | "contrato"
        | "certificado"
        | "licencia"
        | "dni"
        | "cv"
        | "otro"
      employee_status: "activo" | "licencia" | "suspendido" | "baja"
      news_category: "comunicado" | "anuncio" | "novedad" | "alerta"
      request_status: "pendiente" | "aprobado" | "rechazado" | "cancelado"
      request_type:
        | "permiso_personal"
        | "vacaciones"
        | "licencia_medica"
        | "llegada_tarde"
        | "ausencia"
        | "administrativo"
      ticket_category:
        | "certificado_laboral"
        | "consulta"
        | "actualizacion_datos"
        | "reclamo"
        | "soporte"
        | "otro"
      ticket_status: "abierto" | "en_proceso" | "resuelto" | "cerrado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_rrhh", "empleado"],
      contract_type: [
        "planta_permanente",
        "contrato",
        "monotributo",
        "pasantia",
        "suplente",
      ],
      document_type: [
        "contrato",
        "certificado",
        "licencia",
        "dni",
        "cv",
        "otro",
      ],
      employee_status: ["activo", "licencia", "suspendido", "baja"],
      news_category: ["comunicado", "anuncio", "novedad", "alerta"],
      request_status: ["pendiente", "aprobado", "rechazado", "cancelado"],
      request_type: [
        "permiso_personal",
        "vacaciones",
        "licencia_medica",
        "llegada_tarde",
        "ausencia",
        "administrativo",
      ],
      ticket_category: [
        "certificado_laboral",
        "consulta",
        "actualizacion_datos",
        "reclamo",
        "soporte",
        "otro",
      ],
      ticket_status: ["abierto", "en_proceso", "resuelto", "cerrado"],
    },
  },
} as const
