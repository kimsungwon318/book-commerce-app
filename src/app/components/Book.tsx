"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface BookProps {
  book: {
    thumbnail?: Thumbnail[];
    title: string;
    content: string;
    price: number;
    [key: string]: unknown;
  };
  isPurchased: boolean;
}

const Book = ({ book, isPurchased }: BookProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const user: any = session?.user;

  const startCheckout = async () => {
    try {
      const checkoutData = {
        title: book.title,
        price: book.price,
        userId: user?.id,
        bookId: book.id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        }
      );

      const responseData = await response.json();

      if (responseData) {
        router.push(responseData.checkout_url);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePurchaseClick = () => {
    if (isPurchased) {
      alert("すでに購入しています");
    } else {
      setShowModal(true);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handlePurchaseConfirm = () => {
    if (!user) {
      setShowModal(false);
      router.push("/login");
    } else {
      startCheckout();
    }
  };

  // 썸네일 이미지 렌더링 함수
  const renderThumbnail = () => {
    // MicroCMS 다중 이미지 배열 처리
    if (book.thumbnail && book.thumbnail.length > 0) {
      const firstThumbnail = book.thumbnail[0];
      if (firstThumbnail.url && firstThumbnail.url.trim() !== "") {
        return (
          <div className="w-full h-48 relative">
            <Image
              priority
              src={firstThumbnail.url}
              alt="thumbnail"
              fill
              className="object-cover"
            />
          </div>
        );
      }
    }

    // 기본 플레이스홀더
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">이미지 없음</span>
      </div>
    );
  };

  return (
    <>
      {/* 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center m-4">
        <a
          onClick={handlePurchaseClick}
          className="cursor-pointer shadow-2xl duration-300 hover:translate-y-1 hover:shadow-none"
        >
          {renderThumbnail()}

          <div className="px-4 py-4 bg-slate-100">
            <h2 className="text-lg font-semibold truncate">{book.title}</h2>
            <div
              className="mt-2 text-sm text-slate-600"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              dangerouslySetInnerHTML={{ __html: book.content }}
            />
            <p className="mt-2 text-lg font-bold text-slate-800">
              값단：{book.price}円
            </p>
          </div>
        </a>
        {showModal && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-slate-900 bg-opacity-50 flex justify-center items-center modal z-50">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl mb-4">本を購入しますか？</h3>
              <button
                onClick={handlePurchaseConfirm}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              >
                購入する
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Book;
