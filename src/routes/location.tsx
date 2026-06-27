import { createFileRoute } from '@tanstack/react-router'
import { LocationPage } from '../components/LocationPage'

export const Route = createFileRoute('/location')({ component: LocationPage })
