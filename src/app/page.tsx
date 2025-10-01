import { getAllBooks } from "@/lib/microcms/client";
import Book from "./components/Book";
import { BookType, Purchase, User } from "./types/types";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/next-auth/options";

export default async function Home() {
  const { contents } = await getAllBooks();

  const session = await getServerSession(nextAuthOptions);
  const user = session?.user as User;

  let purchasesData: Purchase[] = [];
  let purchaseBookIds: string[] = [];

  if (user) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchases/${user.id}`,
        {
          cache: "no-store",
        }
      );

      if (response.ok) {
        purchasesData = await response.json();
        purchaseBookIds = purchasesData.map(
          (purchaseBook: Purchase) => purchaseBook.bookId
        );
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  }

  return (
    <>
      <main className="md:mt-32 mt-20 px-4">
        <h2 className="text-center w-full font-bold text-3xl mb-8">
          Book Commerce
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {contents.map((book: BookType) => (
            <Book
              key={book.id}
              book={book}
              isPurchased={purchaseBookIds.includes(book.id)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
