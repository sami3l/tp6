const envBase = import.meta.env?.VITE_API_BASE_URL;
const API_BASE_URL = (envBase && envBase.length > 0 ? envBase : "/api").replace(
  /\/$/,
  ""
);
const defaultHeaders = {
  Accept: "application/json, application/hal+json",
  "Content-Type": "application/json",
};

const resolveUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const extractIdFromLinks = (resource) => {
  const selfHref = resource?._links?.self?.href;
  if (!selfHref) return undefined;
  const parts = selfHref.split("/");
  return parts[parts.length - 1];
};

const mapStudent = (resource) => ({
  id: resource?.id ?? extractIdFromLinks(resource),
  fname: resource?.fname ?? resource?.firstName ?? "",
  lname: resource?.lname ?? resource?.lastName ?? "",
  birthDate: resource?.birthDate ?? resource?.dateOfBirth ?? null,
});

const parseJsonBody = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return response.json();
  }

  if (contentType.includes("text")) {
    const text = await response.text();
    const numericValue = Number(text);
    return Number.isNaN(numericValue) ? text : numericValue;
  }

  return null;
};

const request = async (path, options = {}) => {
  const response = await fetch(resolveUrl(path), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    const detail = payload ? `: ${payload}` : "";
    throw new Error(`API request failed (${response.status})${detail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return parseJsonBody(response);
};

export const fetchAllStudents = async () => {
  const data = await request("/students/all").catch(() => []);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(mapStudent);
};

export const fetchStudentCount = async () => {
  const data = await request("/students/count").catch(() => null);
  if (typeof data === "number") {
    return data;
  }
  if (data && typeof data === "object") {
    const possibleKeys = ["count", "total", "totalElements", "value"];
    for (const key of possibleKeys) {
      if (typeof data[key] === "number") {
        return data[key];
      }
    }
  }
  return null;
};

export const fetchStudentsByYear = async () => {
  const data = await request("/students/byYear").catch(() => []);
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?._embedded?.students)
    ? data._embedded.students
    : [];

  return source.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return { label: "Unknown", value: 0 };
    }

    const label =
      entry.year ??
      entry.annee ??
      entry.graduationYear ??
      entry.key ??
      "Unknown";
    const value =
      entry.count ?? entry.total ?? entry.nbrStudent ?? entry.value ?? 0;
    return {
      label,
      value,
    };
  });
};

export const createStudent = async (payload) => {
  return request("/students/save", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(mapStudent);
};

export const updateStudent = async (id, payload) => {
  if (!id) {
    throw new Error("Missing student identifier");
  }
  return request(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      id,
      ...payload,
    }),
  }).then(mapStudent);
};

export const deleteStudent = async (id) => {
  if (!id) {
    throw new Error("Missing student identifier");
  }
  await request(`/students/${id}`, {
    method: "DELETE",
  });
};

export const fetchStudentById = async (id) => {
  if (!id) {
    return null;
  }
  const data = await request(`/students/${id}`).catch(() => null);
  if (!data) {
    return null;
  }
  return mapStudent(data);
};
