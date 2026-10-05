// The CMS config still imports next/cache through its revalidate hooks.
// Astro has no Next.js cache to revalidate, so the hooks do nothing here.
// The CMS strip removes those imports, and this stub with them.
export const revalidatePath = () => {}
export const revalidateTag = () => {}
