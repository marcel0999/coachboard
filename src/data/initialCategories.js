import { DEFAULT_CATEGORY_ID } from '../constants/categories'
import { normalizeCategoryForm } from '../utils/categories'

const BASE_CATEGORIES = [
  {
    id: 'cat-sub14',
    name: 'Sub 14',
    color: '#22c55e',
    ageRange: 'Sub 14',
    birthYearFrom: 2012,
    birthYearTo: 2012,
    active: true,
    sortOrder: 1,
  },
  {
    id: 'cat-sub16',
    name: 'Sub 16',
    color: '#3b82f6',
    ageRange: 'Sub 16',
    birthYearFrom: 2010,
    birthYearTo: 2010,
    active: true,
    sortOrder: 2,
  },
  {
    id: 'cat-sub17',
    name: 'Sub 17',
    color: '#8b5cf6',
    ageRange: 'Sub 17',
    birthYearFrom: 2009,
    birthYearTo: 2009,
    active: true,
    sortOrder: 3,
  },
  {
    id: 'cat-sub20',
    name: 'Sub 20',
    color: '#f59e0b',
    ageRange: 'Sub 20',
    birthYearFrom: 2006,
    birthYearTo: 2006,
    active: true,
    sortOrder: 4,
  },
  {
    id: DEFAULT_CATEGORY_ID,
    name: 'Principal',
    color: '#ef4444',
    ageRange: 'Primera división',
    birthYearFrom: null,
    birthYearTo: null,
    active: true,
    sortOrder: 5,
  },
]

export const INITIAL_CATEGORIES = BASE_CATEGORIES.map((category) => normalizeCategoryForm(category))
