/*=========================================================================
 *
 *  Copyright NumFOCUS
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0.txt
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *=========================================================================*/
#ifndef itkInputTextStream_h
#define itkInputTextStream_h

#include "itkPipeline.h"
#include "itkWASMStringStream.h"

#include <string>
#include <sstream>
#include <fstream>

namespace itk
{
namespace wasm
{

/**
 *\class InputTextStream
 * \brief Input text std::istream for an itk::wasm::Pipeline
 *
 * This stream is read from the filesystem or memory when ITK_WASM_PARSE_ARGS is called.
 * 
 * Call `Get()` to get the std::istream & to use an input to a pipeline.
 * 
 * \ingroup WebAssemblyInterface
 */
class InputTextStream
{
public:
  std::istream & Get() {
    return *m_IStream;
  }

  void SetJSON(const std::string & json)
  {
    if (m_DeleteIStream && m_IStream != nullptr)
    {
      delete m_IStream;
    }
    m_DeleteIStream = false;
    m_WASMStringStream = WASMStringStream::New();
    m_WASMStringStream->SetJSON(json.c_str());

    m_IStream = &(m_WASMStringStream->GetStringStream());
  }

  void SetFileName(const std::string & fileName)
  {
    if (m_DeleteIStream && m_IStream != nullptr)
    {
      delete m_IStream;
    }
    m_IStream = new std::ifstream(fileName, std::ifstream::in);
    m_DeleteIStream = true;
  }

  InputTextStream() = default;
  ~InputTextStream()
  {
    if (m_DeleteIStream && m_IStream != nullptr)
    {
      delete m_IStream;
    }
  }
protected:
  std::istream * m_IStream{nullptr};
  bool m_DeleteIStream{false};
  
  WASMStringStream::Pointer m_WASMStringStream;
};


bool lexical_cast(const std::string &input, InputTextStream &inputStream);

} // end namespace wasm
} // end namespace itk

#endif