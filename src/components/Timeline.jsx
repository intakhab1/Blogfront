import React from 'react'

export const Timeline = () => {
  return (
   <>
    {/* CENTER */}
    <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
        <form
        // onSubmit={handleSubmit(handlePostSubmit)}
        className='bg-primary px-4 rounded-lg'
        >
        <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
            <img
            // src={user?.profileUrl ?? NoProfile}
            alt='User Image'
            className='w-14 h-14 rounded-full object-cover'
            />
            {/* <TextInput
            styles='w-full rounded-full py-5'
            placeholder="What's on your mind ?"
            name='description'
            register={register("description", {
                required: "Write something about the post",
            })}
            error={errors.description ? errors.description.message : ""}
            /> */}
        </div>
        {/* {errMsg?.message && (
            <span
            role='alert'
            className={`text-sm ${
                errMsg?.status === "failed"
                ? "text-[#f64949fe]"
                : "text-[#2ba150fe]"
            } mt-0.5`}
            >
            {errMsg?.message}
            </span>
        )} */}

        <div className='flex items-center justify-between py-4'>
            <label
            htmlFor='imgUpload'
            className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
            >
            <input
                type='file'
                // onChange={(e) => setFile(e.target.files[0])}
                className='hidden'
                id='imgUpload'
                data-max-size='512000'
                accept='.jpg, .png, .jpeg, .mp4'
            />
            {/* <BiImages /> */}
            <span>Image</span>
            </label>

            <label
            className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
            htmlFor='videoUpload'
            >
            <input
                type='file'
                data-max-size='51200'
                // onChange={(e) => setFile(e.target.files[0])}
                className='hidden'
                id='videoUpload'
                accept='.mp4, .wav'
            />
            {/* <BiSolidVideo /> */}
            <span>Video</span>
            </label>

            <label
            className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
            htmlFor='vgifUpload'
            >
            <input
                type='file'
                data-max-size='51200'
                // onChange={(e) => setFile(e.target.files[0])}
                className='hidden'
                id='vgifUpload'
                accept='.gif'
            />
            {/* <BsFiletypeGif /> */}
            <span>Gif</span>
            </label>

            {/* <div>
            {posting ? (
                <Loading />
            ) : (
                <CustomButton
                type='submit'
                title='Post'
                containerStyles='bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm'
                />
            )}
            </div> */}
        </div>
        </form>

        {/* {loading ? (
        <Loading />
        ) : posts?.length > 0 ? (
        posts?.map((post) => (
            <PostCard
            key={post?._id}
            post={post}
            user={user}
            deletePost={handleDelete}
            likePost={handleLikePost}
            />
        ))
        ) : (
        <div className='flex w-full h-full items-center justify-center'>
            <p className='text-lg text-ascent-2'>No Post Available</p>
        </div>
        )} */}
    </div>
   </>
  )
}
