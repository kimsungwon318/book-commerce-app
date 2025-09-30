import { getDetailBook } from "@/lib/microcms/client";
import Image from "next/image";
import React from "react";

const DetailBook = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const book = await getDetailBook(id);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {book.thumbnail && book.thumbnail.length > 0 ? (
          <Image
            src={book.thumbnail[0].url}
            className="w-full h-80 object-cover object-center"
            width={book.thumbnail[0].width}
            height={book.thumbnail[0].height}
            alt={book.title}
          />
        ) : (
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">이미지 없음</span>
          </div>
        )}
        <div className="p-4">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <div
            className="text-gray-700 mt-2"
            dangerouslySetInnerHTML={{ __html: book.content }}
          />

          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold text-slate-700">
              値段：{book.price}円
            </span>
          </div>

          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>
              公開日:{" "}
              {new Date(
                book.publishedAt || book.createdAt
              ).toLocaleDateString()}
            </span>
            <span>
              最終更新: {new Date(book.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBook;
